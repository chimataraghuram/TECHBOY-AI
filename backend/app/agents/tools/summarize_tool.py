"""
Summarize Tool — summarizes text or articles using AI.

Uses the AI service to generate concise summaries of
user-provided text content.
"""

from app.agents.tools.base import BaseTool, ToolResult
from app.services import ai_service


class SummarizeTool(BaseTool):
    """Tool for summarizing text and articles using AI."""

    @property
    def name(self) -> str:
        """Unique tool identifier."""
        return "summarize"

    @property
    def description(self) -> str:
        """Human-readable description of the tool's capability."""
        return "Summarize text or articles"

    async def execute(self, params: dict) -> ToolResult:
        """
        Summarize the provided text content.

        Expected params:
            - text (str): The text content to summarize.
            - url (str, optional): URL of an article to summarize (future enhancement).

        Args:
            params: Dictionary containing the text or URL to summarize.

        Returns:
            ToolResult with the generated summary.
        """
        text = params.get("text", "")
        url = params.get("url", "")

        if not text and not url:
            return ToolResult(
                success=False,
                message="I need some text or a URL to summarize. What would you like me to summarize?",
            )

        content_to_summarize = text or f"Please summarize the content at this URL: {url}"

        summarization_prompt = f"""Please provide a clear, concise summary of the following content.
Focus on the key points, main arguments, and important details.
Keep the summary well-structured and easy to read.

Content to summarize:
---
{content_to_summarize}
---

Provide the summary:"""

        try:
            summary = await ai_service.generate_response(summarization_prompt)
            return ToolResult(
                success=True,
                message=f"📝 **Summary:**\n\n{summary}",
                data={"summary": summary, "source": url or "user-provided text"},
            )
        except Exception as e:
            return ToolResult(
                success=False,
                message=f"Failed to generate summary: {str(e)}",
                data={"error": str(e)},
            )
