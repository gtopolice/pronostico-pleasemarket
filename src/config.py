"""Please.market agent configuration from environment."""

from __future__ import annotations

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    please_x_handle: str = Field(
        default="PleaseMarketBot",
        validation_alias=AliasChoices(
            "PLEASE_X_HANDLE",
            "PLEASE_MARKET_X_HANDLE",
            "CHIWIWIS_X_HANDLE",
        ),
    )
    please_web_url: str = Field(
        default="https://please.market",
        validation_alias=AliasChoices("PLEASE_WEB_URL", "CHIWIWIS_WEB_URL"),
    )
    anyone_web_base: str = "https://anyone.market"
    api_url: str = "https://prod.api.pronostico.market/api"
    api_token: str = ""
    agent_service_secret: str = ""
    link_complete_secret: str = ""

    x_api_bearer_token: str = ""
    x_api_key: str = ""
    x_api_secret: str = ""
    x_access_token: str = ""
    x_access_token_secret: str = ""
    x_bot_user_id: str = ""
    mentions_poll_enabled: bool = True
    mentions_poll_interval_seconds: int = 30

    openai_api_key: str = ""
    please_llm_model: str = Field(
        default="gpt-4o-mini",
        validation_alias=AliasChoices("PLEASE_LLM_MODEL", "CHIWIWIS_LLM_MODEL"),
    )

    agent_deploy_enabled: bool = False
    please_dry_run: bool = Field(
        default=True,
        validation_alias=AliasChoices("PLEASE_DRY_RUN", "CHIWIWIS_DRY_RUN"),
    )
    please_deploy_allowlist: str = Field(
        default="",
        validation_alias=AliasChoices("PLEASE_DEPLOY_ALLOWLIST", "CHIWIWIS_DEPLOY_ALLOWLIST"),
    )
    please_resolve_sla_hours: int = Field(
        default=48,
        validation_alias=AliasChoices("PLEASE_RESOLVE_SLA_HOURS", "CHIWIWIS_RESOLVE_SLA_HOURS"),
    )
    please_default_creator_fee_bps: int = Field(
        default=25,
        validation_alias=AliasChoices("PLEASE_DEFAULT_CREATOR_FEE_BPS", "CHIWIWIS_DEFAULT_CREATOR_FEE_BPS"),
    )
    please_default_image_url: str = Field(
        default="https://anyone.market/og-image.png",
        validation_alias=AliasChoices("PLEASE_DEFAULT_IMAGE_URL", "CHIWIWIS_DEFAULT_IMAGE_URL"),
    )

    please_claim_post_enabled: bool = Field(
        default=True,
        validation_alias=AliasChoices("PLEASE_CLAIM_POST_ENABLED", "CHIWIWIS_CLAIM_POST_ENABLED"),
    )
    please_claim_post_min_usdc: float = Field(
        default=50.0,
        validation_alias=AliasChoices("PLEASE_CLAIM_POST_MIN_USDC", "CHIWIWIS_CLAIM_POST_MIN_USDC"),
    )
    please_claim_post_only_agent_markets: bool = Field(
        default=True,
        validation_alias=AliasChoices(
            "PLEASE_CLAIM_POST_ONLY_AGENT_MARKETS",
            "CHIWIWIS_CLAIM_POST_ONLY_CHIWIWIS_MARKETS",
        ),
    )
    please_claim_post_max_per_hour: int = Field(
        default=10,
        validation_alias=AliasChoices("PLEASE_CLAIM_POST_MAX_PER_HOUR", "CHIWIWIS_CLAIM_POST_MAX_PER_HOUR"),
    )
    claims_poll_interval_seconds: int = 30

    database_url: str = "postgresql://please:please@localhost:5432/please"
    please_rate_limit_per_user_day: int = Field(
        default=5,
        validation_alias=AliasChoices("PLEASE_RATE_LIMIT_PER_USER_DAY", "CHIWIWIS_RATE_LIMIT_PER_USER_DAY"),
    )
    please_global_kill_switch: bool = Field(
        default=False,
        validation_alias=AliasChoices("PLEASE_GLOBAL_KILL_SWITCH", "CHIWIWIS_GLOBAL_KILL_SWITCH"),
    )

    host: str = "0.0.0.0"
    port: int = 8080

    def allowlist_ids(self) -> set[str]:
        if not self.please_deploy_allowlist.strip():
            return set()
        return {x.strip() for x in self.please_deploy_allowlist.split(",") if x.strip()}


settings = Settings()
