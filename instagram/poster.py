#!/usr/bin/env python3
"""
Pete Instagram auto-poster.

Reads the next word pair from vocab_generator.WORDS (cycling when exhausted),
generates the image, uploads to Firebase Storage, and posts to Instagram.

Required env vars:
  IG_USER_ID                  - Instagram Business account ID
  IG_ACCESS_TOKEN             - Long-lived page access token (refresh monthly)
  FIREBASE_STORAGE_BUCKET     - e.g. pete-app.appspot.com
  FIREBASE_SERVICE_ACCOUNT_JSON - Full service account JSON as a string
"""

import sys
import tempfile
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from vocab_generator import make_vocab_post, WORDS
from api import post_image
from firebase_store import get_vocab_index, set_vocab_index, upload_image
from captions import vocab_caption


def run():
    index = get_vocab_index()
    old_word, new_word, definition = WORDS[index % len(WORDS)]

    print(f"[pete-poster] {old_word} → {new_word}  (queue index {index})")

    slug = f"vocab-{old_word.lower()}-{new_word.lower()}"

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
        tmp = f.name

    try:
        make_vocab_post(old_word, new_word, definition, tmp)
        public_url = upload_image(tmp, f"{slug}.png")
        caption = vocab_caption(old_word, new_word)
        media_id = post_image(public_url, caption)
        set_vocab_index(index + 1)
        print(f"[pete-poster] Posted. Media ID: {media_id}")
    finally:
        os.unlink(tmp)


if __name__ == "__main__":
    run()
