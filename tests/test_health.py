import pytest
from httpx import AsyncClient
import sys
import os

# Add api directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../apps/api")))
from app.main import app

@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "TerraMind API"

@pytest.mark.asyncio
async def test_spatial_layers():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/v1/spatial/layers")
    assert response.status_code == 200
    layers = response.json()
    assert len(layers) > 0
    assert layers[0]["category"] == "satellite"
