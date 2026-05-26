"""Notes route – CRUD API for user notes."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.deps import get_current_user, get_db
from app.models import note as note_model
from app.schemas.note import NoteCreate, NoteListResponse, NoteResponse
from app.services import notes_service

router = APIRouter(prefix="/notes", tags=["Notes"])


@router.post("", response_model=NoteResponse, status_code=201)
async def create_note(
    body: NoteCreate,
    user: dict[str, Any] = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> NoteResponse:
    """Create a new note for the authenticated user."""
    note = await notes_service.create_note(db, user["id"], body.title, body.content)
    return NoteResponse(**note)


@router.get("", response_model=NoteListResponse)
async def list_notes(
    user: dict[str, Any] = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> NoteListResponse:
    """Return all notes belonging to the authenticated user."""
    notes = await notes_service.list_notes(db, user["id"])
    return NoteListResponse(notes=[NoteResponse(**n) for n in notes])


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: str,
    user: dict[str, Any] = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> NoteResponse:
    """Retrieve a single note by its ID."""
    note = await note_model.get_note(db, note_id, user["id"])
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return NoteResponse(**note)


@router.delete("/{note_id}", status_code=204)
async def delete_note(
    note_id: str,
    user: dict[str, Any] = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> None:
    """Delete a note by its ID."""
    deleted = await notes_service.remove_note(db, note_id, user["id"])
    if not deleted:
        raise HTTPException(status_code=404, detail="Note not found")
