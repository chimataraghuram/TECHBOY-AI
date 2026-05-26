"""Note schemas – request/response models for note endpoints."""

from datetime import datetime

from pydantic import BaseModel


class NoteCreate(BaseModel):
    """Payload for creating a new note."""

    title: str
    content: str


class NoteResponse(BaseModel):
    """Public representation of a single note."""

    id: str
    title: str
    content: str
    created_at: datetime
    updated_at: datetime


class NoteListResponse(BaseModel):
    """Wrapper for a list of notes."""

    notes: list[NoteResponse]
