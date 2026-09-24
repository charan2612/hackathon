from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import subprocess, tempfile, pathlib, time, os

app=FastAPI(title="CodePilotX Execution Service")

class ExecuteRequest(BaseModel):
    language:str
    source_code:str=Field(min_length=1,max_length=100000)
    tests:list[dict]=[]

def command_for(language, workdir):
    if language=="python": return ["python","main.py"]
    if language=="javascript": return ["node","main.js"]
    if language=="java": return ["bash","-lc","javac Main.java && java Main"]
    if language=="cpp": return ["bash","-lc","g++ -O2 -std=c++17 main.cpp -o main && ./main"]
    raise ValueError("Unsupported language")

@app.post("/execute")
def execute(req:ExecuteRequest):
    suffix={"python":"main.py","javascript":"main.js","java":"Main.java","cpp":"main.cpp"}.get(req.language)
    if not suffix: raise HTTPException(400,"Unsupported language")
    start=time.perf_counter()
    with tempfile.TemporaryDirectory() as td:
        path=pathlib.Path(td)/suffix
        path.write_text(req.source_code,encoding="utf-8")
        try:
            cmd=command_for(req.language,td)
            proc=subprocess.run(
                cmd,cwd=td,input=(req.tests[0]["input"] if req.tests else ""),
                text=True,capture_output=True,timeout=5,
                shell=False,
            )
            elapsed=int((time.perf_counter()-start)*1000)
            status="success" if proc.returncode==0 else "failed"
            return {
                "status":status,
                "stdout":proc.stdout[:10000],
                "stderr":proc.stderr[:10000],
                "compilation_error":proc.stderr[:10000] if req.language in ("java","cpp") and proc.returncode else None,
                "passed_tests":1 if status=="success" else 0,
                "failed_tests":0 if status=="success" else 1,
                "execution_time_ms":elapsed,
                "memory_usage_kb":0
            }
        except subprocess.TimeoutExpired:
            return {"status":"timeout","stdout":"","stderr":"Code execution timed out.","compilation_error":None,
                    "passed_tests":0,"failed_tests":len(req.tests) or 1,"execution_time_ms":5000,"memory_usage_kb":0}
        except Exception:
            raise HTTPException(500,"Execution failed.")
