from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.db import get_db

router = APIRouter(tags=["problems"])

@router.get("/problems")
def list_problems(
    search: str = "",
    topic: str = "",
    difficulty: str = "",
    db: Session = Depends(get_db),
):
    q = """
      SELECT id,title,slug,description,constraints,examples,difficulty,topic,
             supported_languages,starter_code
      FROM problems
      WHERE (:search = '' OR title ILIKE '%' || :search || '%')
        AND (:topic = '' OR topic = :topic)
        AND (:difficulty = '' OR difficulty = :difficulty)
      ORDER BY created_at DESC
    """
    rows = db.execute(text(q), {"search": search, "topic": topic, "difficulty": difficulty}).mappings().all()
    return {"items": [dict(r) for r in rows]}

@router.get("/problems/{problem_id}")
def get_problem(problem_id: str, db: Session = Depends(get_db)):
    row = db.execute(text("""
      SELECT id,title,slug,description,constraints,examples,difficulty,topic,
             supported_languages,starter_code
      FROM problems WHERE id=:id
    """), {"id": problem_id}).mappings().first()
    if not row:
        raise HTTPException(404, "Problem not found")
    tests = db.execute(text("""
      SELECT id,input,expected_output,is_sample
      FROM test_cases WHERE problem_id=:id ORDER BY created_at
    """), {"id": problem_id}).mappings().all()
    return {**dict(row), "test_cases": [dict(t) for t in tests]}
