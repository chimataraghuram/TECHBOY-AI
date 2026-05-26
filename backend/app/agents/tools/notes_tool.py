"""
Notes Tool — saves notes and tasks to the database.

Wraps the notes_service module to provide a standardized
tool interface for the orchestrator.
"""

from app.agents.tools.base import BaseTool, ToolResult


class NotesTool(BaseTool):
    """Tool for saving notes and tasks."""

    @property
    def name(self) -> str:
        """Unique tool identifier."""
        return "notes"

    @property
    def description(self) -> str:
        """Human-readable description of the tool's capability."""
        return "Save notes and tasks"

    async def execute(self, params: dict) -> ToolResult:
        """
        Save a note or task to the database.

        Expected params:
            - title (str): Title of the note.
            - content (str): Content/body of the note.
            - user_id (str, optional): The user who owns the note.

        Args:
            params: Dictionary of note parameters.

        Returns:
            ToolResult with confirmation of the saved note.
        """
        title = params.get("title", "")
        content = params.get("content", "")

        if not title and not content:
            return ToolResult(
                success=False,
                message="I need at least a title or content for the note. What would you like to save?",
            )

        # Default title if only content is provided
        if not title:
            title = "Quick Note"

        try:
            # Import the notes service (created by another agent)
            from app.services.notes_service import create_note

            note = await create_note(
                title=title,
                content=content,
                user_id=params.get("user_id"),
            )
            return ToolResult(
                success=True,
                message=f"📌 Note saved: \"{title}\"",
                data={"title": title, "content": content, "note": note},
            )
        except ImportError:
            return ToolResult(
                success=False,
                message="Notes service is not yet configured. Your note was not saved.",
                data={"title": title, "content": content},
            )
        except Exception as e:
            return ToolResult(
                success=False,
                message=f"Failed to save note: {str(e)}",
                data={"error": str(e)},
            )
