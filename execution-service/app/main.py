from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import subprocess, tempfile, pathlib, time, json, ast

app = FastAPI(title="CodePilotX Execution Service")


class ExecuteRequest(BaseModel):
    language: str
    source_code: str = Field(min_length=1, max_length=100000)
    tests: list[dict] = []


def command_for(language, workdir):
    if language == "python":
        return ["python", "main.py"]
    if language == "javascript":
        return ["node", "main.js"]
    if language == "java":
        return ["bash", "-lc", "javac Main.java && java Main"]
    if language == "cpp":
        return ["bash", "-lc", "g++ -O2 -std=c++17 main.cpp -o main && ./main"]
    raise ValueError("Unsupported language")


def build_python_source(source_code, test_input):
    parts = test_input.rsplit(",", 1)

    if len(parts) != 2:
        raise ValueError("Python function test input must contain arguments separated by a comma.")

    nums = ast.literal_eval(parts[0].strip())
    target = ast.literal_eval(parts[1].strip())

    harness = f"""
{source_code}

result = two_sum({repr(nums)}, {repr(target)})
print(json.dumps(result))
"""

    return harness


@app.post("/execute")
def execute(req: ExecuteRequest):
    suffix = {
        "python": "main.py",
        "javascript": "main.js",
        "java": "Main.java",
        "cpp": "main.cpp",
    }.get(req.language)

    if not suffix:
        raise HTTPException(400, "Unsupported language")

    start = time.perf_counter()

    with tempfile.TemporaryDirectory() as td:
        passed_tests = 0
        failed_tests = 0
        last_stdout = ""
        last_stderr = ""
        last_compilation_error = None

        tests = req.tests or [{"input": "", "expected_output": ""}]

        try:
            for test in tests:
                source = req.source_code

                if req.language == "python" and "def two_sum(" in source:
                    source = build_python_source(
                        source,
                        str(test.get("input", ""))
                    )

                path = pathlib.Path(td) / suffix
                path.write_text(source, encoding="utf-8")

                proc = subprocess.run(
                    command_for(req.language, td),
                    cwd=td,
                    input="" if req.language == "python" and "def two_sum(" in req.source_code else test.get("input", ""),
                    text=True,
                    capture_output=True,
                    timeout=5,
                    shell=False,
                )

                last_stdout = proc.stdout[:10000]
                last_stderr = proc.stderr[:10000]

                if proc.returncode != 0:
                    failed_tests += 1

                    if req.language in ("java", "cpp"):
                        last_compilation_error = proc.stderr[:10000]

                    continue

                actual = proc.stdout.strip()
                expected = str(test.get("expected_output", "")).strip()

                try:
                    actual_value = json.loads(actual)
                    expected_value = json.loads(expected)

                    if actual_value == expected_value:
                        passed_tests += 1
                    else:
                        failed_tests += 1
                except Exception:
                    if actual == expected:
                        passed_tests += 1
                    else:
                        failed_tests += 1

            elapsed = int((time.perf_counter() - start) * 1000)

            status = "success" if failed_tests == 0 else "failed"

            return {
                "status": status,
                "stdout": last_stdout,
                "stderr": last_stderr,
                "compilation_error": last_compilation_error,
                "passed_tests": passed_tests,
                "failed_tests": failed_tests,
                "execution_time_ms": elapsed,
                "memory_usage_kb": 0,
            }

        except subprocess.TimeoutExpired:
            return {
                "status": "timeout",
                "stdout": "",
                "stderr": "Code execution timed out.",
                "compilation_error": None,
                "passed_tests": passed_tests,
                "failed_tests": len(tests) - passed_tests,
                "execution_time_ms": 5000,
                "memory_usage_kb": 0,
            }

        except Exception as exc:
            raise HTTPException(500, f"Execution failed: {exc}")
