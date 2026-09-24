from fastapi import Header, HTTPException
from uuid import UUID

def current_user_id(authorization: str | None = Header(default=None)) -> UUID:
    """
    Development-friendly identity extractor.
    Production deployment should verify the Supabase JWT signature and use its `sub`.
    Never trust a user_id sent in JSON for ownership-sensitive operations.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    token = authorization[7:].strip()
    try:
        return UUID(token)
    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid development token. Use a UUID while wiring Supabase Auth."
        )
