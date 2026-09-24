from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.orm import Session
from uuid import UUID
import httpx
from app.db import get_db
from app.auth import current_user_id
from app.settings import settings

router = APIRouter(tags=["submissions"])

class RunRequest(BaseModel):
    problem_id: UUID
    language: str
    source_code: str = Field(min_length=1, max_length=100000)

class SubmitRequest(RunRequest):
    pass

async def execute(code: str, language: str, tests: list[dict]):
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            f"{settings.execution_service_url}/execute",
            json={"language": language, "source_code": code, "tests": tests},
        )
        response.raise_for_status()
        return response.json()

@router.post("/code/run")
async def run_code(req: RunRequest, user_id: UUID = Depends(current_user_id), db: Session = Depends(get_db)):
    tests = db.execute(text("""
      SELECT input, expected_output FROM test_cases WHERE problem_id=:id
    """), {"id": str(req.problem_id)}).mappings().all()
    if not tests:
        tests = [{"input": "", "expected_output": ""}]
    try:
        result = await execute(req.source_code, req.language, [dict(x) for x in tests])
    except Exception:
        raise HTTPException(503, "Code execution service is temporarily unavailable.")
    return result

@router.post("/code/submit")
async def submit(req: SubmitRequest, user_id: UUID = Depends(current_user_id), db: Session = Depends(get_db)):
    problem = db.execute(text("SELECT id FROM problems WHERE id=:id"), {"id": str(req.problem_id)}).first()
    if not problem:
        raise HTTPException(404, "Problem not found")

    row = db.execute(text("""
      INSERT INTO submissions(user_id,problem_id,language,source_code,status)
      VALUES(:u,:p,:l,:c,'running') RETURNING id,created_at
    """), {"u":str(user_id),"p":str(req.problem_id),"l":req.language,"c":req.source_code}).mappings().one()
    db.commit()

    tests = db.execute(text("""
      SELECT input, expected_output FROM test_cases WHERE problem_id=:id
    """), {"id": str(req.problem_id)}).mappings().all()

    try:
        result = await execute(req.source_code, req.language, [dict(x) for x in tests])
    except Exception:
        db.execute(text("UPDATE submissions SET status='error' WHERE id=:id"), {"id":str(row["id"])})
        db.commit()
        raise HTTPException(503, "Code execution service is temporarily unavailable.")

    status = result.get("status", "error")
    db.execute(text("""
      UPDATE submissions SET status=:s WHERE id=:id
    """), {"s":status,"id":str(row["id"])})
    db.execute(text("""
      INSERT INTO execution_results(
        submission_id,status,stdout,stderr,compilation_error,passed_tests,
        failed_tests,execution_time_ms,memory_usage_kb
      ) VALUES(:sid,:status,:stdout,:stderr,:compile,:passed,:failed,:time,:memory)
    """), {
        "sid":str(row["id"]), "status":status, "stdout":result.get("stdout",""),
        "stderr":result.get("stderr",""), "compile":result.get("compilation_error"),
        "passed":result.get("passed_tests",0), "failed":result.get("failed_tests",0),
        "time":result.get("execution_time_ms"), "memory":result.get("memory_usage_kb")
    })
    db.execute(text("""
      INSERT INTO progress_events(user_id,event_type,metadata)
      VALUES(:u,'submission',:m)
    """), {"u":str(user_id),"m":'{"status":"'+status+'","problem_id":"'+str(req.problem_id)+'"}'})
    db.commit()

    return {"submission_id":str(row["id"]), **result}

@router.get("/submissions")
def submissions(user_id: UUID = Depends(current_user_id), db: Session = Depends(get_db)):
    rows = db.execute(text("""
      SELECT s.id,s.problem_id,p.title,s.language,s.status,s.created_at,
             er.passed_tests,er.failed_tests,er.execution_time_ms
      FROM submissions s
      JOIN problems p ON p.id=s.problem_id
      LEFT JOIN execution_results er ON er.submission_id=s.id
      WHERE s.user_id=:u ORDER BY s.created_at DESC LIMIT 100
    """), {"u":str(user_id)}).mappings().all()
    return {"items":[dict(r) for r in rows]}
