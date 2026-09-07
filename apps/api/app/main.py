from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.endpoints import health, spatial, copilot

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API and multi-agent coordination server for TerraMind Environmental Intelligence.",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Cross-Origin Resource Sharing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1 Routers
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(spatial.router, prefix=f"{settings.API_V1_STR}/spatial")
app.include_router(copilot.router, prefix=f"{settings.API_V1_STR}/copilot")

@app.get("/")
def root():
    return {
        "message": "Welcome to TerraMind Environmental Intelligence API",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
