from app.core.security import create_access_token, create_refresh_token
from app.schemas.auth import TokenPair


def build_token_pair(user_id: str) -> TokenPair:
    return TokenPair(
        access_token=create_access_token(subject=user_id),
        refresh_token=create_refresh_token(subject=user_id),
    )
