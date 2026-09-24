from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from uuid import UUID

from app.db import get_db
from app.auth import current_user_id

router = APIRouter(tags=["mistake-fingerprint"])


@router.get("/mistake-fingerprint")
def mistake_fingerprint(
    user_id: UUID = Depends(current_user_id),
    db: Session = Depends(get_db),
):
    rows = db.execute(
        text(
            """
            SELECT
                s.id,
                s.problem_id,
                s.language,
                s.status,
                s.created_at,
                e.status AS execution_status,
                e.stderr,
                e.compilation_error,
                e.passed_tests,
                e.failed_tests,
                e.execution_time_ms,
                e.memory_usage_kb
            FROM submissions s
            LEFT JOIN execution_results e
                ON e.submission_id = s.id
            WHERE s.user_id = :user_id
            ORDER BY s.created_at DESC
            LIMIT 100
            """
        ),
        {"user_id": str(user_id)},
    ).mappings().all()

    fingerprint = {
        "total_submissions": len(rows),
        "compilation_errors": 0,
        "runtime_errors": 0,
        "failed_tests": 0,
        "slow_submissions": 0,
        "memory_heavy_submissions": 0,
        "patterns": [],
    }

    for row in rows:
        compilation_error = row["compilation_error"]
        stderr = row["stderr"]
        failed_tests = row["failed_tests"] or 0
        execution_time = row["execution_time_ms"] or 0
        memory_usage = row["memory_usage_kb"] or 0

        if compilation_error:
            fingerprint["compilation_errors"] += 1

        if stderr:
            fingerprint["runtime_errors"] += 1

        if failed_tests > 0:
            fingerprint["failed_tests"] += failed_tests

        if execution_time > 1000:
            fingerprint["slow_submissions"] += 1

        if memory_usage > 100000:
            fingerprint["memory_heavy_submissions"] += 1

    # -----------------------------
    # Generate recurring patterns
    # -----------------------------

    if fingerprint["compilation_errors"] > 0:
        fingerprint["patterns"].append({
            "type": "compilation",
            "count": fingerprint["compilation_errors"],
            "title": "Compilation mistakes",
            "description": (
                f"You have encountered {fingerprint['compilation_errors']} "
                "compilation error(s). Check syntax, imports, and function definitions "
                "before submitting."
            ),
            "suggestion": (
                "Run through the code once for syntax and missing-variable errors "
                "before submitting."
            ),
        })

    if fingerprint["runtime_errors"] > 0:
        fingerprint["patterns"].append({
            "type": "runtime",
            "count": fingerprint["runtime_errors"],
            "title": "Runtime errors",
            "description": (
                f"You have encountered {fingerprint['runtime_errors']} "
                "runtime error(s)."
            ),
            "suggestion": (
                "Check array boundaries, null values, invalid operations, "
                "and assumptions about the input."
            ),
        })

    if fingerprint["failed_tests"] > 0:
        fingerprint["patterns"].append({
            "type": "testing",
            "count": fingerprint["failed_tests"],
            "title": "Test-case failures",
            "description": (
                f"Your submissions have failed {fingerprint['failed_tests']} "
                "test case(s)."
            ),
            "suggestion": (
                "Before submitting, consider edge cases such as empty input, "
                "duplicates, minimum values, and maximum values."
            ),
        })

    if fingerprint["slow_submissions"] > 0:
        fingerprint["patterns"].append({
            "type": "performance",
            "count": fingerprint["slow_submissions"],
            "title": "Performance issues",
            "description": (
                f"{fingerprint['slow_submissions']} submission(s) took "
                "more than one second to execute."
            ),
            "suggestion": (
                "Look for unnecessary nested loops and repeated work. "
                "Consider whether a hash map, set, or more efficient algorithm "
                "could reduce the complexity."
            ),
        })

    if fingerprint["memory_heavy_submissions"] > 0:
        fingerprint["patterns"].append({
            "type": "memory",
            "count": fingerprint["memory_heavy_submissions"],
            "title": "High memory usage",
            "description": (
                f"{fingerprint['memory_heavy_submissions']} submission(s) "
                "used relatively high memory."
            ),
            "suggestion": (
                "Check whether large arrays, dictionaries, or duplicated data "
                "can be avoided."
            ),
        })

    return fingerprint