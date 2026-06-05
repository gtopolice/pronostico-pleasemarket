"""Chiwiwis configuration from environment."""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    chiwiwis_x_handle: str = "Chiwiwis"
    chiwiwis_web_url: str = "https://chiwiwis.anyone.market"
    anyone_web_base: str = "https://anyone.market"
    api_url: str = "https://prod.api.pronostico.market/api"
    api_token: str = ""
    agent_service_secret: str = ""

    x_api_bearer_token: str = ""
    x_api_key: str = ""
    x_api_secret: str = ""
    x_access_token: str = ""
    x_access_token_secret: str = ""

    openai_api_key: str = ""
    chiwiwis_llm_model: str = "gpt-4o-mini"

    agent_deploy_enabled: bool = False
    chiwiwis_dry_run: bool = True
    chiwiwis_deploy_allowlist: str = ""
    chiwiwis_resolve_sla_hours: int = 48
    chiwiwis_default_creator_fee_bps: int = 25
    chiwiwis_default_image_url: str = "https://anyone.market/og-image.png"

    chiwiwis_claim_post_enabled: bool = True
    chiwiwis_claim_post_min_usdc: float = 50.0
    chiwiwis_claim_post_only_chiwiwis_markets: bool = True
    chiwiwis_claim_post_max_per_hour: int = 10
    claims_poll_interval_seconds: int = 30

    database_url: str = "postgresql://chiwiwis:chiwiwis@localhost:5432/chiwiwis"
    chiwiwis_rate_limit_per_user_day: int = 5
    chiwiwis_global_kill_switch: bool = False

    host: str = "0.0.0.0"
    port: int = 8080

    def allowlist_ids(self) -> set[str]:
        if not self.chiwiwis_deploy_allowlist.strip():
            return set()
        return {x.strip() for x in self.chiwiwis_deploy_allowlist.split(",") if x.strip()}


settings = Settings()
