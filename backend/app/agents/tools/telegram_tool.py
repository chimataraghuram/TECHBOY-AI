"""
Telegram Tool — sends messages via the Telegram Bot API.

Wraps the telegram_service module to provide a standardized
tool interface for the orchestrator.
"""

from app.agents.tools.base import BaseTool, ToolResult


class TelegramTool(BaseTool):
    """Tool for sending messages via Telegram."""

    @property
    def name(self) -> str:
        """Unique tool identifier."""
        return "telegram"

    @property
    def description(self) -> str:
        """Human-readable description of the tool's capability."""
        return "Send Telegram messages"

    async def execute(self, params: dict) -> ToolResult:
        """
        Send a message via Telegram.

        Expected params:
            - message (str): The message text to send.
            - chat_id (str, optional): Override the default chat ID.

        Args:
            params: Dictionary of message parameters.

        Returns:
            ToolResult with success/failure status and message.
        """
        message_text = params.get("message")

        if not message_text:
            return ToolResult(
                success=False,
                message="I need a message to send via Telegram. What should I send?",
            )

        try:
            # Import the telegram service (created by another agent)
            from app.services.telegram_service import send_message

            chat_id = params.get("chat_id")
            result = await send_message(text=message_text, chat_id=chat_id)
            return ToolResult(
                success=True,
                message=f"✅ Telegram message sent successfully.",
                data={"message": message_text, "result": result},
            )
        except ImportError:
            return ToolResult(
                success=False,
                message="Telegram service is not yet configured. Please set up your Telegram bot token first.",
            )
        except Exception as e:
            return ToolResult(
                success=False,
                message=f"Failed to send Telegram message: {str(e)}",
                data={"error": str(e)},
            )
