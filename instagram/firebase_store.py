import base64
import json
import os
import requests
import firebase_admin
from firebase_admin import credentials, firestore

_DOC_PATH = ("config", "instagram_poster")


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
    """Uploads image to transfer.sh and returns a public URL."""
    with open(local_path, 'rb') as f:
        response = requests.put(
            f"https://transfer.sh/{filename}",
            data=f,
            headers={"Max-Days": "3"},
        )
    response.raise_for_status()
    return response.text.strip()
