"""
Gmail Tool — sends emails via the Gmail API.

Wraps the gmail_service module to provide a standardized
tool interface for the orchestrator.
"""

from app.agents.tools.base import BaseTool, ToolResult


class GmailTool(BaseTool):
    """Tool for sending emails via Gmail."""

    @property
    def name(self) -> str:
        """Unique tool identifier."""
        return "gmail"

    @property
    def description(self) -> str:
        """Human-readable description of the tool's capability."""
        return "Send emails via Gmail"

    async def execute(self, params: dict) -> ToolResult:
        """
        Send an email using the Gmail service.

        Expected params:
            - to (str): Recipient email address.
            - subject (str): Email subject line.
            - body (str): Email body content.

        Args:
            params: Dictionary of email parameters.

        Returns:
            ToolResult with success/failure status and message.
        """
        # Validate required parameters
        to = params.get("to")
        subject = params.get("subject")
        body = params.get("body")

        if not to:
            return ToolResult(
                success=False,
                message="I need a recipient email address to send the email. Who should I send it to?",
            )

        if not subject:
            return ToolResult(
                success=False,
                message="I need a subject line for the email. What should the subject be?",
            )

        if not body:
            return ToolResult(
                success=False,
                message="I need the email body content. What should the email say?",
            )

        try:
            # Import the gmail service (created by another agent)
            from app.services.gmail_service import send_email

            result = await send_email(to=to, subject=subject, body=body)
            return ToolResult(
                success=True,
                message=f"✅ Email sent successfully to {to} with subject \"{subject}\".",
                data={"to": to, "subject": subject, "result": result},
            )
        except ImportError:
            return ToolResult(
                success=False,
                message="Gmail service is not yet configured. Please set up Gmail credentials first.",
            )
        except Exception as e:
            return ToolResult(
                success=False,
                message=f"Failed to send email to {to}: {str(e)}",
                data={"error": str(e)},
            )
