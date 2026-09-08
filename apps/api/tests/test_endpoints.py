import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health_check():
    """Test the health check endpoint."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data


@pytest.mark.asyncio
async def test_root_endpoint():
    """Test the root endpoint."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "docs" in data


@pytest.mark.asyncio
async def test_copilot_endpoint_mock():
    """Test the copilot endpoint in demo mode (no LLM configured)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/copilot/query",
            json={
                "query": "What is the air quality in Valle de Aburrá?",
                "bbox": [-75.65, 6.12, -75.48, 6.38]
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "summary" in data
        assert "confidence_score" in data
        assert "sources" in data
        assert "metrics" in data


@pytest.mark.asyncio
async def test_spatial_layers():
    """Test the spatial layers endpoint."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/spatial/layers")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0


@pytest.mark.asyncio
async def test_spatial_features_bbox():
    """Test the spatial features by bounding box endpoint."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(
            "/api/v1/spatial/features/bbox",
            params={
                "min_lon": -75.65,
                "min_lat": 6.12,
                "max_lon": -75.48,
                "max_lat": 6.38
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "FeatureCollection"
        assert "features" in data
