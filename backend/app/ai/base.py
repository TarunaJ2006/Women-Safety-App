from abc import ABC, abstractmethod
from typing import Any, Dict

class BaseInferenceEngine(ABC):
    @abstractmethod
    def load_model(self, artifact_path: str) -> None:
        pass
    @abstractmethod
    def predict(self, input_data: Any) -> Dict[str, Any]:
        pass
    @property
    @abstractmethod
    def status(self) -> Dict[str, Any]:
        pass
