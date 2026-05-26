"""
Orchestrator — the PicoClaw-inspired agentic orchestration layer.

Routes user messages to the appropriate tools based on classified
intent, manages streaming chat for general conversation, and
logs all task executions.
"""

from datetime import datetime, timezone
from typing import AsyncGenerator

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.agents.intent import Intent, IntentType, classify_intent
from app.agents.tools.base import BaseTool, ToolResult
from app.services import ai_service


class Orchestrator:
    """
    Central orchestrator that processes user messages.

    Classifies intent, routes to the appropriate tool or streams
    a chat response, and logs all task activity.
    """

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        """
        Initialize the orchestrator with database and tools.

        Args:
            db: The MongoDB database instance.
        """
        self.db = db
        self._tools: dict[str, BaseTool] = {}
        self._register_tools()

    def _register_tools(self) -> None:
        """Register all available tools with graceful fallbacks."""
        # Import tools — each may depend on services not yet created,
        # so we wrap imports in try/except for resilience.
        try:
            from app.agents.tools.gmail_tool import GmailTool
            tool = GmailTool()
            self._tools[tool.name] = tool
        except ImportError:
            pass

        try:
            from app.agents.tools.telegram_tool import TelegramTool
            tool = TelegramTool()
            self._tools[tool.name] = tool
        except ImportError:
            pass

        try:
            from app.agents.tools.summarize_tool import SummarizeTool
            tool = SummarizeTool()
            self._tools[tool.name] = tool
        except ImportError:
            pass

        try:
            from app.agents.tools.notes_tool import NotesTool
            tool = NotesTool()
            self._tools[tool.name] = tool
        except ImportError:
            pass

    # ── Intent-to-Tool Mapping ───────────────────────────────────────────

    _INTENT_TOOL_MAP: dict[IntentType, str] = {
        IntentType.SEND_EMAIL: "gmail",
        IntentType.SEND_TELEGRAM: "telegram",
        IntentType.SUMMARIZE: "summarize",
        IntentType.SAVE_NOTE: "notes",
    }

    async def process(
        self,
        message: str,
        session_id: str,
        user_id: str,
    ) -> AsyncGenerator[str, None]:
        """
        Process a user message through the orchestration pipeline.

        1. Classify the intent of the message.
        2. If it's a general chat, stream the AI response.
        3. If it's a task intent, execute the matching tool and return the result.

        Args:
            message: The user's input message.
            session_id: The current chat session identifier.
            user_id: The authenticated user's identifier.

        Yields:
            Text chunks of the response (either streamed AI or tool result).
        """
        # Step 1: Classify intent
        intent: Intent = await classify_intent(message)

        # Step 2: Route based on intent
        if intent.type == IntentType.GENERAL_CHAT:
            # Stream chat response
            messages = [{"role": "user", "content": message}]
            async for chunk in ai_service.stream_chat(messages):
                yield chunk
            return

        # Step 3: Find and execute the matching tool
        tool_name = self._INTENT_TOOL_MAP.get(intent.type)
        tool = self._tools.get(tool_name) if tool_name else None

        if tool is None:
            # No tool available — fall back to chat
            fallback_msg = (
                f"I understood you want to {intent.type.value.lower().replace('_', ' ')}, "
                f"but that capability isn't available yet. Let me help you with a response instead."
            )
            yield fallback_msg

            messages = [{"role": "user", "content": message}]
            async for chunk in ai_service.stream_chat(messages):
                yield chunk
            return

        # Execute the tool
        try:
            result: ToolResult = await tool.execute(intent.params)

            # Log the task execution
            await self._log_task(
                user_id=user_id,
                session_id=session_id,
                intent=intent,
                params=intent.params,
                result=result,
            )

            yield result.message

        except Exception as e:
            error_msg = f"I encountered an error while trying to {tool.description.lower()}: {str(e)}"
            yield error_msg

    async def _log_task(
        self,
        user_id: str,
        session_id: str,
        intent: Intent,
        params: dict,
        result: ToolResult,
    ) -> None:
        """
        Log a task execution to the task_logs collection.

        Args:
            user_id: The user who triggered the task.
            session_id: The chat session where the task was triggered.
            intent: The classified intent.
            params: Parameters passed to the tool.
            result: The result from tool execution.
        """
        log_entry = {
            "user_id": user_id,
            "session_id": session_id,
            "intent": intent.type.value,
            "confidence": intent.confidence,
            "params": params,
            "success": result.success,
            "message": result.message,
            "data": result.data,
            "timestamp": datetime.now(timezone.utc),
        }

        try:
            await self.db.task_logs.insert_one(log_entry)
        except Exception:
            # Logging failure should not break the user experience
            pass
