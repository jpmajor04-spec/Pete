import random

_VOCAB_HOOKS = [
    "Most people use the same 500 words their whole life.\n\nPete's fixing that.",
    "Save this. Use it this week.",
    "The right word changes everything.",
    "Your word choices say more than you think.",
    "Upgrade your vocabulary. One word at a time.",
    "You know this word now. Use it.",
    "Stop settling for basic. Pete's got better words.",
    "One small upgrade. Big difference.",
]

_TAGS = "#vocabulary #wordoftheday #wordnerd #learnwords #peteapp"


def vocab_caption(old_word: str, new_word: str) -> str:
    hook = random.choice(_VOCAB_HOOKS)
    return f"{hook}\n\nPete — Vocab app · App Store\n\n{_TAGS}"
