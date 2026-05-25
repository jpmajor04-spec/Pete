import base64
import json
import os
import requests
import firebase_admin
from firebase_admin import credentials, firestore

_DOC_PATH = ("config", "instagram_poster")
_BUCKET = "pete-s-word-wardrobe.firebasestorage.app"


def _init():
    if not firebase_admin._apps:
        raw = base64.b64decode(os.environ["FIREBASE_SERVICE_ACCOUNT_JSON"]).decode()
        sa = json.loads(raw)
        cred = credentials.Certificate(sa)
        firebase_admin.initialize_app(cred)


def get_vocab_index() -> int:
    _init()
    db = firestore.client()
    doc = db.collection(_DOC_PATH[0]).document(_DOC_PATH[1]).get()
    return doc.to_dict().get("vocab_index", 0) if doc.exists else 0


def set_vocab_index(index: int):
    _init()
    db = firestore.client()
    db.collection(_DOC_PATH[0]).document(_DOC_PATH[1]).set({
        "vocab_index": index,
        "last_posted": firestore.SERVER_TIMESTAMP,
    }, merge=True)


def upload_image(local_path: str, filename: str) -> str:
    """Uploads to Firebase Storage REST API and returns a public download URL."""
    import google.auth.transport.requests
    from google.oauth2 import service_account as sa_module

    raw = base64.b64decode(os.environ["FIREBASE_SERVICE_ACCOUNT_JSON"]).decode()
    sa_info = json.loads(raw)

    creds = sa_module.Credentials.from_service_account_info(
        sa_info,
        scopes=["https://www.googleapis.com/auth/cloud-platform"],
    )
    creds.refresh(google.auth.transport.requests.Request())

    object_path = f"instagram/{filename}"
    encoded_path = object_path.replace("/", "%2F")

    with open(local_path, "rb") as f:
        resp = requests.post(
            f"https://firebasestorage.googleapis.com/v0/b/{_BUCKET}/o",
            params={"name": object_path},
            headers={
                "Authorization": f"Bearer {creds.token}",
                "Content-Type": "image/png",
            },
            data=f.read(),
        )
    resp.raise_for_status()
    token = resp.json()["downloadTokens"]
    return f"https://firebasestorage.googleapis.com/v0/b/{_BUCKET}/o/{encoded_path}?alt=media&token={token}"
