"""
Base tool abstraction for the AI agent orchestration layer.

Defines the interface that all agent tools must implement,
along with a standard result dataclass.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class ToolResult:
    """
    Standardized result returned by all tool executions.

    Attributes:
        success: Whether the tool execution completed successfully.
        message: Human-readable message describing the result.
        data: Optional dictionary containing structured result data.
    """
    success: bool
    message: str
    data: dict[str, Any] | None = field(default=None)


class BaseTool(ABC):
    """
    Abstract base class for all orchestrator tools.

    Every tool must define a name, description, and an async
    execute method that takes parameters and returns a ToolResult.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Unique identifier for this tool."""
        ...

    @property
    @abstractmethod
    def description(self) -> str:
        """Human-readable description of what this tool does."""
        ...

    @abstractmethod
    async def execute(self, params: dict) -> ToolResult:
        """
        Execute the tool with the given parameters.

        Args:
            params: Dictionary of parameters extracted from user intent.

        Returns:
            A ToolResult indicating success/failure and any output data.
        """
        ...
