from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session as DBSession

from database.connection import get_db
from database.orm_models import Session
from models.schemas import (
    SessionCreate,
    SessionListResponse,
    SessionResponse,
    SessionUpdate,
)

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.get("", response_model=list[SessionListResponse])
def list_sessions(
    status: str | None = Query(None),
    db: DBSession = Depends(get_db),
) -> list[SessionListResponse]:
    query = db.query(Session)
    if status:
        query = query.filter(Session.status == status)
    return query.all()


@router.get("/{session_id}", response_model=SessionResponse)
def get_session(
    session_id: str, db: DBSession = Depends(get_db)
) -> SessionResponse:
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("", response_model=SessionResponse, status_code=201)
def create_session(
    body: SessionCreate, db: DBSession = Depends(get_db)
) -> SessionResponse:
    session = Session(
        name=body.name.strip(),
        team_ids=body.team_ids,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.put("/{session_id}", response_model=SessionResponse)
def update_session(
    session_id: str, body: SessionUpdate, db: DBSession = Depends(get_db)
) -> SessionResponse:
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if body.name is not None:
        session.name = body.name.strip()
    if body.status is not None:
        session.status = body.status
    db.commit()
    db.refresh(session)
    return session


@router.delete("/{session_id}", status_code=204)
def delete_session(
    session_id: str, db: DBSession = Depends(get_db)
) -> None:
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
