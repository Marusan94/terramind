import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "TerraMind Environmental Intelligence API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:postgres@localhost:5432/terramind"
    )
    
    # AI / Model Routing (OmniRoute)
    DEFAULT_LLM_PROVIDER: str = os.getenv("DEFAULT_LLM_PROVIDER", "openrouter")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "deepseek/deepseek-chat")
    FAST_MODEL: str = os.getenv("FAST_MODEL", "meta-llama/llama-3-8b-instruct")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
