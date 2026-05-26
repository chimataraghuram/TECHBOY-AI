"""
Intent classification for the AI agent orchestrator.

Uses the AI service to classify user messages into actionable
intents with extracted parameters.
"""

import json
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from app.services import ai_service


class IntentType(str, Enum):
    """Enumeration of all supported user intent types."""
    GENERAL_CHAT = "GENERAL_CHAT"
    SEND_EMAIL = "SEND_EMAIL"
    SEND_TELEGRAM = "SEND_TELEGRAM"
    SUMMARIZE = "SUMMARIZE"
    SAVE_NOTE = "SAVE_NOTE"


@dataclass
class Intent:
    """
    Represents a classified user intent.

    Attributes:
        type: The classified intent type.
        params: Extracted parameters relevant to the intent.
        confidence: Confidence score between 0.0 and 1.0.
    """
    type: IntentType
    params: dict[str, Any] = field(default_factory=dict)
    confidence: float = 0.0


# Minimum confidence threshold to act on an intent
_CONFIDENCE_THRESHOLD = 0.6


async def classify_intent(message: str) -> Intent:
    """
    Classify a user message into an actionable intent.

    Uses the AI service to analyze the message and extract
    the intent type, relevant parameters, and confidence score.

    Falls back to GENERAL_CHAT if classification fails or
    the confidence is below the threshold.

    Args:
        message: The user's raw input message.

    Returns:
        An Intent object with the classified type and extracted params.
    """
    classification_prompt = f"""You are an intent classifier for a personal AI assistant.

Analyze the following user message and determine the intent.

Return a JSON object with exactly these fields:
- "intent": one of ["GENERAL_CHAT", "SEND_EMAIL", "SEND_TELEGRAM", "SUMMARIZE", "SAVE_NOTE"]
- "params": a dictionary of extracted parameters:
  - For SEND_EMAIL: {{"to": "email@example.com", "subject": "...", "body": "..."}}
  - For SEND_TELEGRAM: {{"message": "..."}}
  - For SUMMARIZE: {{"text": "..." or "url": "..."}}
  - For SAVE_NOTE: {{"title": "...", "content": "..."}}
  - For GENERAL_CHAT: {{}}
- "confidence": float between 0.0 and 1.0

Respond with ONLY the JSON object. No markdown, no extra text.

User message: "{message}"
"""

    try:
        response = await ai_service.generate_response(classification_prompt)
        text = response.strip()

        # Strip markdown code fences if present
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

        result = json.loads(text)

        intent_str = result.get("intent", "GENERAL_CHAT")
        params = result.get("params", {})
        confidence = float(result.get("confidence", 0.5))

        # Validate intent type
        try:
            intent_type = IntentType(intent_str)
        except ValueError:
            intent_type = IntentType.GENERAL_CHAT
            confidence = 0.5

        # Fall back to GENERAL_CHAT if confidence is too low
        if confidence < _CONFIDENCE_THRESHOLD and intent_type != IntentType.GENERAL_CHAT:
            intent_type = IntentType.GENERAL_CHAT
            params = {}

        return Intent(type=intent_type, params=params, confidence=confidence)

    except (json.JSONDecodeError, KeyError, TypeError, Exception):
        return Intent(
            type=IntentType.GENERAL_CHAT,
            params={},
            confidence=0.5,
        )
