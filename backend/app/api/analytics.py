from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from uuid import UUID
from app.db import get_db
from app.auth import current_user_id

router = APIRouter(tags=["analytics"])

@router.get("/dashboard")
def dashboard(user_id: UUID = Depends(current_user_id), db: Session = Depends(get_db)):
    u = str(user_id)
    solved = db.execute(text("""
      SELECT count(DISTINCT problem_id) FROM submissions
      WHERE user_id=:u AND status IN ('accepted','success')
    """), {"u":u}).scalar() or 0
    submissions = db.execute(text("SELECT count(*) FROM submissions WHERE user_id=:u"), {"u":u}).scalar() or 0
    ai = db.execute(text("SELECT count(*) FROM ai_interactions WHERE user_id=:u"), {"u":u}).scalar() or 0
    independent = db.execute(text("""
      SELECT count(*) FROM submissions s
      WHERE s.user_id=:u AND NOT EXISTS(
        SELECT 1 FROM ai_interactions a WHERE a.user_id=s.user_id
        AND a.created_at BETWEEN s.created_at - interval '30 minutes' AND s.created_at
      )
    """), {"u":u}).scalar() or 0
    activity = db.execute(text("""
      SELECT date(created_at) day,count(*) count
      FROM progress_events WHERE user_id=:u
      GROUP BY date(created_at) ORDER BY day DESC LIMIT 30
    """), {"u":u}).mappings().all()
    return {
      "problems_solved": solved,
      "submissions": submissions,
      "ai_assistance_interactions": ai,
      "independent_submissions": independent,
      "activity":[dict(x) for x in reversed(activity)],
      "has_activity": submissions > 0
    }

@router.get("/mistakes")
def mistakes(user_id: UUID = Depends(current_user_id), db: Session = Depends(get_db)):
    rows = db.execute(text("""
      SELECT category,frequency,trend,examples,updated_at
      FROM mistake_fingerprints WHERE user_id=:u ORDER BY frequency DESC
    """), {"u":str(user_id)}).mappings().all()
    return {"items":[dict(x) for x in rows], "enough_evidence": len(rows) > 0}

@router.get("/independence")
def independence(user_id: UUID = Depends(current_user_id), db: Session = Depends(get_db)):
    u=str(user_id)
    ai_count=db.execute(text("SELECT count(*) FROM ai_interactions WHERE user_id=:u"),{"u":u}).scalar() or 0
    total=db.execute(text("SELECT count(*) FROM submissions WHERE user_id=:u"),{"u":u}).scalar() or 0
    success=db.execute(text("SELECT count(*) FROM submissions WHERE user_id=:u AND status IN ('accepted','success')"),{"u":u}).scalar() or 0
    return {"ai_assisted_attempts":ai_count,"submissions":total,"successful_submissions":success,
            "methodology":"AI Assistance is the persisted count of AI interactions. Success is successful submissions divided by submissions; this is a platform metric, not a psychological measurement."}

@router.get("/skills")
def skills(user_id: UUID = Depends(current_user_id), db: Session = Depends(get_db)):
    rows=db.execute(text("""
      SELECT sn.id,sn.name,coalesce(sp.score,0) score,coalesce(sp.status,'Not Started') status
      FROM skill_nodes sn LEFT JOIN skill_progress sp
      ON sp.skill_node_id=sn.id AND sp.user_id=:u ORDER BY sn.name
    """),{"u":str(user_id)}).mappings().all()
    return {"items":[dict(x) for x in rows]}

@router.get("/learning-debt")
def learning_debt(user_id: UUID = Depends(current_user_id), db: Session = Depends(get_db)):
    rows=db.execute(text("""SELECT concept,evidence,severity,recent_performance,recommendation,progress
                            FROM learning_debt WHERE user_id=:u ORDER BY severity"""),{"u":str(user_id)}).mappings().all()
    return {"items":[dict(x) for x in rows]}

@router.get("/progress")
def progress(user_id: UUID = Depends(current_user_id), db: Session = Depends(get_db)):
    rows=db.execute(text("""
      SELECT event_type,count(*) count FROM progress_events
      WHERE user_id=:u GROUP BY event_type ORDER BY count DESC
    """),{"u":str(user_id)}).mappings().all()
    return {"events":[dict(x) for x in rows]}

@router.get("/leaderboard")
def leaderboard(user_id: UUID = Depends(current_user_id), db: Session = Depends(get_db)):
    rows=db.execute(text("""
      SELECT p.name,l.score,l.period
      FROM leaderboard_scores l JOIN profiles p ON p.id=l.user_id
      WHERE l.visibility=true ORDER BY l.score DESC LIMIT 50
    """)).mappings().all()
    return {"items":[dict(x) for x in rows]}
