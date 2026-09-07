"""
OmniRoute: Provider-agnostic LLM client for TerraMind.
Routes queries across OpenRouter, local Ollama instances, or custom API endpoints.
"""
from typing import Dict, Any, List, Optional
import httpx
from app.core.config import settings

class OmniRouteClient:
    def __init__(self):
        self.provider = settings.DEFAULT_LLM_PROVIDER
        self.api_key = settings.OPENROUTER_API_KEY
        self.default_model = settings.DEFAULT_MODEL
        self.ollama_url = settings.OLLAMA_BASE_URL

    async def complete(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.2
    ) -> Dict[str, Any]:
        """Dispatches completion request according to configured provider."""
        target_model = model or self.default_model

        if self.provider == "openrouter" and self.api_key:
            return await self._call_openrouter(messages, target_model, temperature)
        elif self.provider == "ollama":
            return await self._call_ollama(messages, target_model)
        else:
            query_text = next(
                (m["content"] for m in reversed(messages) if m.get("role") == "user"),
                "",
            )
            return {
                "content": (
                    "Demo local Valle de Aburrá (sin LLM externo). "
                    "Radar SIATA simulado: célula convectiva ~49 dBZ sobre la ladera oriental "
                    "(Santa Elena), con lluvia moderada a fuerte (35-50 mm/h) hacia el centro. "
                    "PM2.5 más alto en La Alpujarra (~38 µg/m³) y turbidez elevada en Bello "
                    "(35.2 NTU). Consulta: "
                    f"{query_text[:280]}"
                ),
                "model": target_model,
                "provider": "mock",
            }

    async def _call_openrouter(self, messages: List[Dict[str, str]], model: str, temperature: float) -> Dict[str, Any]:
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://terramind.org",
            "X-Title": "TerraMind Environmental Intelligence",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(url, json=payload, headers=headers)
            res.raise_for_status()
            data = res.json()
            return {
                "content": data["choices"][0]["message"]["content"],
                "model": model,
                "provider": "openrouter"
            }

    async def _call_ollama(self, messages: List[Dict[str, str]], model: str) -> Dict[str, Any]:
        url = f"{self.ollama_url}/api/chat"
        payload = {
            "model": model,
            "messages": messages,
            "stream": False
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(url, json=payload)
            res.raise_for_status()
            data = res.json()
            return {
                "content": data["message"]["content"],
                "model": model,
                "provider": "ollama"
            }

omniroute = OmniRouteClient()
