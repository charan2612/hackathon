from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session
from uuid import UUID
import json

from app.db import get_db
from app.auth import current_user_id
from app.services.ai_service import AIService


router = APIRouter(tags=["ai"])
ai = AIService()


class ReviewRequest(BaseModel):
    problem_id: UUID
    language: str
    source_code: str
    test_results: dict = {}
    previous_errors: list[str] = []


class HintRequest(BaseModel):
    problem_id: UUID
    language: str
    source_code: str


class DecisionRequest(BaseModel):
    problem_id: UUID
    original_code: str
    suggestion: dict
    decision: str
    modified_code: str | None = None
    confidence: float | None = None


@router.post("/ai/review")
async def review(
    req: ReviewRequest,
    user_id: UUID = Depends(current_user_id),
    db: Session = Depends(get_db),
):
    p = db.execute(
        text(
            "SELECT title, description, constraints, examples "
            "FROM problems WHERE id=:id"
        ),
        {"id": str(req.problem_id)},
    ).mappings().first()

    if not p:
        raise HTTPException(404, "Problem not found")

    try:
        result = await ai.review_code(
            req.source_code,
            req.language,
            dict(p),
            req.test_results,
            req.previous_errors,
        )
    except Exception as e:
        print("AI REVIEW ERROR:", repr(e))
        raise HTTPException(503, f"AI service error: {str(e)}")

    # Save AI interaction
    db.execute(
        text(
            """INSERT INTO ai_interactions(
                user_id,
                problem_id,
                interaction_type,
                request_payload,
                response_payload
            )
            VALUES(
                :u,
                :p,
                'review',
                :req,
                :res
            )"""
        ),
        {
            "u": str(user_id),
            "p": str(req.problem_id),
            "req": json.dumps({
                "language": req.language,
                "source_code": req.source_code,
                "test_results": req.test_results,
                "previous_errors": req.previous_errors,
            }),
            "res": json.dumps(result),
        },
    )

    # Save AI review
    db.execute(
        text(
            """INSERT INTO ai_reviews(
                user_id,
                problem_id,
                original_code,
                review,
                confidence
            )
            VALUES(
                :u,
                :p,
                :c,
                :r,
                :conf
            )"""
        ),
        {
            "u": str(user_id),
            "p": str(req.problem_id),
            "c": req.source_code,
            "r": json.dumps(result),
            "conf": result.get("confidence"),
        },
    )

    db.commit()

    return result


@router.post("/ai/hint")
async def hint(
    req: HintRequest,
    user_id: UUID = Depends(current_user_id),
    db: Session = Depends(get_db),
):
    p = db.execute(
        text(
            "SELECT title, description "
            "FROM problems WHERE id=:id"
        ),
        {"id": str(req.problem_id)},
    ).mappings().first()

    if not p:
        raise HTTPException(404, "Problem not found")

    try:
        result = await ai.hint(
            req.source_code,
            req.language,
            dict(p),
        )
    except Exception as e:
        print("AI HINT ERROR:", repr(e))
        raise HTTPException(503, f"AI service error: {str(e)}")

    db.execute(
        text(
            """INSERT INTO ai_interactions(
                user_id,
                problem_id,
                interaction_type,
                response_payload
            )
            VALUES(
                :u,
                :p,
                'hint',
                :res
            )"""
        ),
        {
            "u": str(user_id),
            "p": str(req.problem_id),
            "res": json.dumps(result),
        },
    )

    db.commit()

    return result


@router.post("/ai/decision")
def decision(
    req: DecisionRequest,
    user_id: UUID = Depends(current_user_id),
    db: Session = Depends(get_db),
):
    if req.decision not in {"accept", "modify", "reject"}:
        raise HTTPException(
            400,
            "Decision must be accept, modify, or reject",
        )

    db.execute(
        text(
            """INSERT INTO ai_decisions(
                user_id,
                problem_id,
                original_code,
                suggestion,
                decision,
                modified_code,
                confidence
            )
            VALUES(
                :u,
                :p,
                :o,
                :s,
                :d,
                :m,
                :c
            )"""
        ),
        {
            "u": str(user_id),
            "p": str(req.problem_id),
            "o": req.original_code,
            "s": json.dumps(req.suggestion),
            "d": req.decision,
            "m": req.modified_code,
            "c": req.confidence,
        },
    )

    db.commit()

    return {
        "saved": True,
        "decision": req.decision,
    }


# AI Independence
@router.get("/ai/independence")
def independence(
    user_id: UUID = Depends(current_user_id),
    db: Session = Depends(get_db),
):
    rows = db.execute(
        text(
            """
            SELECT interaction_type, COUNT(*) AS count
            FROM ai_interactions
            WHERE user_id = :u
            GROUP BY interaction_type
            """
        ),
        {"u": str(user_id)},
    ).mappings().all()

    counts = {
        "hint": 0,
        "review": 0,
    }

    for row in rows:
        counts[row["interaction_type"]] = row["count"]

    total_ai = counts["hint"] + counts["review"]

    return {
        "hint_count": counts["hint"],
        "review_count": counts["review"],
        "total_ai_interactions": total_ai,
    }