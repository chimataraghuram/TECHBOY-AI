"""
AI Service using the Google GenAI SDK.

Provides streaming chat, intent classification, and single-response
generation powered by Gemini models.
"""

import json
from typing import AsyncGenerator

from google import genai
from google.genai import types

from app.core.config import get_settings

# ── TECHBOY AI System Prompt ─────────────────────────────────────────────────

SYSTEM_PROMPT = """You are TECHBOY AI — a highly capable, friendly, and proactive personal AI assistant.

Your capabilities include:
- Having natural, intelligent conversations on any topic
- Sending emails via Gmail on behalf of the user
- Sending Telegram messages to configured contacts
- Summarizing text, articles, and documents
- Saving notes and task reminders
- Executing multi-step tasks through tool orchestration

Personality traits:
- Professional yet approachable — you're like a smart colleague
- Concise and action-oriented — you get things done
- You proactively suggest next steps when relevant
- You confirm before executing irreversible actions (like sending emails)

When a user asks you to perform a task (send email, telegram, save note, etc.),
extract the relevant parameters and confirm the action before executing.
Always respond in a helpful, structured manner."""


def _get_client() -> genai.Client:
    """
    Create and return a configured GenAI client.

    Returns:
        A google.genai.Client instance configured with the API key.
    """
    settings = get_settings()
    return genai.Client(api_key=settings.GEMINI_API_KEY)


async def stream_chat(
    messages: list[dict],
    system_prompt: str | None = None,
) -> AsyncGenerator[str, None]:
    """
    Stream a chat response from Gemini.

    Sends the conversation history to Gemini and yields text chunks
    as they are generated.

    Args:
        messages: List of message dicts with 'role' and 'content' keys.
        system_prompt: Optional system prompt override.

    Yields:
        Text chunks from the model response.
    """
    client = _get_client()
    prompt = system_prompt or SYSTEM_PROMPT

    # Build contents from message history
    contents: list[types.Content] = []
    for msg in messages:
        role = "user" if msg.get("role") == "user" else "model"
        contents.append(
            types.Content(
                role=role,
                parts=[types.Part.from_text(text=msg["content"])],
            )
        )

    # Try primary model, fall back to secondary
    models = ["gemini-2.5-flash", "gemini-2.0-flash"]

    for model_name in models:
        try:
            config = types.GenerateContentConfig(
                system_instruction=prompt,
                temperature=0.7,
                max_output_tokens=4096,
            )

            async for chunk in client.aio.models.generate_content_stream(
                model=model_name,
                contents=contents,
                config=config,
            ):
                if chunk.text:
                    yield chunk.text
            return  # Success — exit after streaming
        except Exception as e:
            if model_name == models[-1]:
                # Last model failed — yield error message
                yield f"I'm having trouble connecting to AI services right now. Error: {str(e)}"
            continue  # Try the next model


async def classify_intent(message: str) -> dict:
    """
    Classify the intent of a user message using Gemini.

    Sends the message to Gemini with a classification prompt and
    parses the JSON response containing intent and parameters.

    Args:
        message: The user's input message to classify.

    Returns:
        A dictionary with 'intent', 'params', and 'confidence' keys.
    """
    client = _get_client()

    classification_prompt = f"""Analyze the following user message and classify its intent.

Return a JSON object with exactly these fields:
- "intent": one of ["GENERAL_CHAT", "SEND_EMAIL", "SEND_TELEGRAM", "SUMMARIZE", "SAVE_NOTE"]
- "params": extracted parameters as a dict (e.g., {{"to": "...", "subject": "...", "body": "..."}} for emails)
- "confidence": a float between 0.0 and 1.0

Rules:
- SEND_EMAIL: user wants to send an email. Extract "to", "subject", "body".
- SEND_TELEGRAM: user wants to send a Telegram message. Extract "message".
- SUMMARIZE: user wants to summarize text or an article. Extract "text" or "url".
- SAVE_NOTE: user wants to save a note or reminder. Extract "title", "content".
- GENERAL_CHAT: for all other conversational messages.

Respond with ONLY the JSON object, no markdown formatting or extra text.

User message: "{message}"
"""

    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.0-flash",
            contents=classification_prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
                max_output_tokens=512,
            ),
        )

        # Parse JSON response
        text = response.text.strip()
        # Remove markdown code fences if present
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

        return json.loads(text)
    except (json.JSONDecodeError, Exception):
        return {
            "intent": "GENERAL_CHAT",
            "params": {},
            "confidence": 0.5,
        }


async def generate_response(prompt: str) -> str:
    """
    Generate a single (non-streaming) response from Gemini.

    Args:
        prompt: The prompt text to send to the model.

    Returns:
        The generated text response.
    """
    client = _get_client()

    models = ["gemini-2.5-flash", "gemini-2.0-flash"]

    for model_name in models:
        try:
            response = await client.aio.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    temperature=0.7,
                    max_output_tokens=4096,
                ),
            )
            return response.text
        except Exception as e:
            if model_name == models[-1]:
                return f"I'm having trouble generating a response right now. Error: {str(e)}"
            continue

    return "Unable to generate a response at this time."
