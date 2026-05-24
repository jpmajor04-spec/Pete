import os
import requests

_BASE = "https://graph.facebook.com/v21.0"


def post_image(image_url: str, caption: str) -> str:
    """Creates an Instagram media container and publishes it. Returns media ID."""
    uid = os.environ["IG_USER_ID"]
    token = os.environ["IG_ACCESS_TOKEN"]

    r = requests.post(f"{_BASE}/{uid}/media", params={
        "image_url": image_url,
        "caption": caption,
        "access_token": token,
    })
    r.raise_for_status()
    creation_id = r.json()["id"]

    r = requests.post(f"{_BASE}/{uid}/media_publish", params={
        "creation_id": creation_id,
        "access_token": token,
    })
    r.raise_for_status()
    return r.json()["id"]


def refresh_token() -> str:
    """Refreshes the long-lived access token (call monthly). Returns new token."""
    token = os.environ["IG_ACCESS_TOKEN"]
    r = requests.get(f"{_BASE}/refresh_access_token", params={
        "grant_type": "ig_refresh_token",
        "access_token": token,
    })
    r.raise_for_status()
    return r.json()["access_token"]
