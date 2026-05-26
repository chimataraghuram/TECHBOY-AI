"""Telegram service – send messages via the Telegram Bot API using httpx."""

from typing import Any

import httpx

TELEGRAM_API_BASE = "https://api.telegram.org"


async def send_message(
    chat_id: str,
    text: str,
    bot_token: str,
) -> dict[str, Any]:
    """Send a text message to *chat_id* using the Telegram Bot API.

    Returns a dict with ``success`` (bool) and ``message`` (str).
    On success the Telegram ``message_id`` is included under ``message``.
    """
    url = f"{TELEGRAM_API_BASE}/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown",
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(url, json=payload)
            data = response.json()

        if response.status_code == 200 and data.get("ok"):
            msg_id = data["result"]["message_id"]
            return {
                "success": True,
                "message": f"Message sent successfully (message_id={msg_id})",
            }

        # Telegram returned an error
        description = data.get("description", "Unknown Telegram error")
        return {"success": False, "message": description}

    except httpx.HTTPError as exc:
        return {"success": False, "message": f"HTTP error: {exc}"}
    except Exception as exc:  # noqa: BLE001
        return {"success": False, "message": f"Unexpected error: {exc}"}
