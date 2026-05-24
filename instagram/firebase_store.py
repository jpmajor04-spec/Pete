import json
import os
import firebase_admin
from firebase_admin import credentials, firestore, storage

_DOC_PATH = ("config", "instagram_poster")


def _init():
    if not firebase_admin._apps:
        sa = json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT_JSON"])
        cred = credentials.Certificate(sa)
        firebase_admin.initialize_app(cred, {
            "storageBucket": os.environ["FIREBASE_STORAGE_BUCKET"]
        })


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
    """Uploads image to Firebase Storage and returns a public URL."""
    _init()
    bucket = storage.bucket()
    blob = bucket.blob(f"instagram/{filename}")
    blob.upload_from_filename(local_path, content_type="image/png")
    blob.make_public()
    return blob.public_url
