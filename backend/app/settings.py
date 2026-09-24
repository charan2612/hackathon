from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/codepilotx"
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    llm_api_key: str = ""
    llm_model: str = ""
    llm_base_url: str = ""
    execution_service_url: str = "http://localhost:9000"
    cors_origins: list[str] = [
    "http://localhost:5173",
    "http://localhost:5174",
]
    jwt_secret: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
