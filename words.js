const WORDS = [
  {
    word: "sanguine",
    pronunciation: "SANG-gwin",
    partOfSpeech: "adjective",
    definition: "Optimistic or positive, especially in a difficult situation.",
    etymology: "From Latin sanguineus (blood), from the medieval belief that a blood-dominant temperament made one cheerful.",
    example: "Despite the setbacks, she remained sanguine about the project's chances.",
    tip: "Think: someone with rosy cheeks — full of life and optimism.",
    usage: "Use it when someone stays hopeful against the odds."
  },
  {
    word: "laconic",
    pronunciation: "luh-KON-ik",
    partOfSpeech: "adjective",
    definition: "Using very few words; brief and to the point.",
    etymology: "From the Laconians (Spartans), who were famous for their terse speech.",
    example: "His laconic reply — just 'no' — ended the debate.",
    tip: "The Spartans were so famously brief, an entire style is named after them.",
    usage: "Use it to describe someone who says a lot with very little."
  },
  {
    word: "mellifluous",
    pronunciation: "meh-LIF-loo-us",
    partOfSpeech: "adjective",
    definition: "Sweet or musical; pleasant to hear.",
    etymology: "From Latin mel (honey) + fluere (to flow) — 'flowing with honey'.",
    example: "Her mellifluous voice made even bad news sound tolerable.",
    tip: "Mel = honey. A mellifluous voice flows like honey.",
    usage: "Use it to compliment someone's voice or beautifully written prose."
  },
  {
    word: "ephemeral",
    pronunciation: "ih-FEM-er-ul",
    partOfSpeech: "adjective",
    definition: "Lasting for a very short time; transitory.",
    etymology: "From Greek ephemeros — 'lasting only a day' (epi + hemera, day).",
    example: "The beauty of cherry blossoms is ephemeral — that's part of their charm.",
    tip: "Think: a mayfly lives only one day — ephemeral.",
    usage: "Use it when talking about fleeting moments, trends, or experiences."
  },
  {
    word: "perspicacious",
    pronunciation: "pur-spi-KAY-shus",
    partOfSpeech: "adjective",
    definition: "Having a ready insight into things; shrewd and perceptive.",
    etymology: "From Latin perspicax — 'sharp-sighted', from perspicere (to see through).",
    example: "A perspicacious reader will notice the clues hidden in chapter one.",
    tip: "Per-spic = to see through. Someone who sees right through to the truth.",
    usage: "Use it to describe someone who spots what others miss."
  },
  {
    word: "loquacious",
    pronunciation: "loh-KWAY-shus",
    partOfSpeech: "adjective",
    definition: "Tending to talk a great deal; talkative.",
    etymology: "From Latin loquax, from loqui (to talk).",
    example: "Our loquacious neighbor could turn a two-minute chat into an hour.",
    tip: "Loqui = to talk. A loquacious person loves to talk.",
    usage: "A polite and slightly funny way to call someone a chatterbox."
  },
  {
    word: "propitious",
    pronunciation: "pruh-PISH-us",
    partOfSpeech: "adjective",
    definition: "Giving or indicating a good chance of success; favourable.",
    etymology: "From Latin propitius — 'favourable', from pro (before) + petere (to seek).",
    example: "The clear skies were a propitious sign for our outdoor wedding.",
    tip: "Pro = in favour of. A propitious moment is one working in your favour.",
    usage: "Use it when timing or circumstances seem especially fortunate."
  },
  {
    word: "truculent",
    pronunciation: "TRUCK-yoo-lent",
    partOfSpeech: "adjective",
    definition: "Eager or quick to argue or fight; aggressively defiant.",
    etymology: "From Latin truculentus — 'fierce', from trux (savage).",
    example: "The truculent teenager slammed every door in the house.",
    tip: "Think: a truck barreling toward you — aggressive and unstoppable.",
    usage: "Use it to describe someone spoiling for a fight or confrontation."
  },
  {
    word: "desultory",
    pronunciation: "DEZ-ul-tor-ee",
    partOfSpeech: "adjective",
    definition: "Lacking a plan, purpose, or enthusiasm; going from subject to subject randomly.",
    etymology: "From Latin desultorius — 'leaping about', from desultor (circus rider who leapt between horses).",
    example: "We made desultory conversation while waiting for the meeting to start.",
    tip: "A desultory effort jumps around like a circus rider with no direction.",
    usage: "Use it to describe aimless conversation or half-hearted effort."
  },
  {
    word: "recondite",
    pronunciation: "REK-un-dyte",
    partOfSpeech: "adjective",
    definition: "Not known by many people; dealing with obscure subject matter.",
    etymology: "From Latin reconditus — 'hidden away', from recondere (to store away).",
    example: "His recondite knowledge of 15th-century Flemish painting impressed everyone.",
    tip: "Recondite knowledge is hidden away, known only to a few.",
    usage: "Use it for impressively specialized or obscure expertise."
  },
  {
    word: "quotidian",
    pronunciation: "kwoh-TID-ee-un",
    partOfSpeech: "adjective",
    definition: "Of or occurring every day; ordinary or everyday.",
    etymology: "From Latin quotidianus — 'daily', from quotidie (every day).",
    example: "She found beauty in the quotidian rituals of morning coffee and the newspaper.",
    tip: "Quot = how many, die = day. Quotidian = what happens each and every day.",
    usage: "Use it to elevate a description of the mundane or routine."
  },
  {
    word: "liminal",
    pronunciation: "LIM-ih-nul",
    partOfSpeech: "adjective",
    definition: "Relating to a transitional or in-between state or period.",
    etymology: "From Latin limen — 'threshold'.",
    example: "Graduation is a liminal moment — you're no longer a student but not yet a professional.",
    tip: "Limen = threshold. You're standing at the doorway between two worlds.",
    usage: "Use it for any in-between moment: dawn, a job change, moving cities."
  },
  {
    word: "palimpsest",
    pronunciation: "PAL-imp-sest",
    partOfSpeech: "noun",
    definition: "Something altered or reused but still bearing traces of its earlier form.",
    etymology: "From Greek palimpsestos — 'scraped again', used for manuscripts erased and rewritten.",
    example: "The old city is a palimpsest — Roman ruins beneath medieval streets beneath modern shops.",
    tip: "Old manuscripts were scraped clean and rewritten, but you could still see the ghost of what was.",
    usage: "Use it for places, people, or things that carry their history visibly."
  },
  {
    word: "fungible",
    pronunciation: "FUN-jih-bul",
    partOfSpeech: "adjective",
    definition: "Interchangeable; able to replace or be replaced by an identical item.",
    etymology: "From Medieval Latin fungibilis, from Latin fungi (to perform).",
    example: "Money is fungible — a ten-dollar bill is worth exactly as much as ten ones.",
    tip: "Dollar bills are fungible: swap one for another and nothing changes.",
    usage: "Use it when discussing whether things or people are truly replaceable."
  },
  {
    word: "enervate",
    pronunciation: "EN-er-vayt",
    partOfSpeech: "verb",
    definition: "To make someone feel drained of energy or vitality; to weaken.",
    etymology: "From Latin enervare — 'to remove the sinews', from e- (out) + nervus (sinew).",
    example: "Three hours of back-to-back meetings enervated him completely.",
    tip: "Caution: sounds like 'energize' but means the opposite — it drains you.",
    usage: "Use it when something saps your will or energy completely."
  },
  {
    word: "garrulous",
    pronunciation: "GAIR-oo-lus",
    partOfSpeech: "adjective",
    definition: "Excessively talkative, especially on trivial matters.",
    etymology: "From Latin garrulus — 'talkative', from garrire (to chatter).",
    example: "The garrulous cabdriver gave us his life story in a ten-minute ride.",
    tip: "Garrire = to chatter. Garrulous is even more than loquacious — rambling, not just talkative.",
    usage: "Use it for someone who chatters endlessly about nothing important."
  },
  {
    word: "reticent",
    pronunciation: "RET-ih-sent",
    partOfSpeech: "adjective",
    definition: "Not revealing one's thoughts or feelings readily; reserved.",
    etymology: "From Latin reticere — 'to keep silent', from re- + tacere (to be silent).",
    example: "He was reticent about his past, rarely mentioning anything before age thirty.",
    tip: "Tacere = silent (as in 'tacit'). Reticent people stay silent about themselves.",
    usage: "Use it to describe someone guarded or reluctant to open up."
  },
  {
    word: "vertiginous",
    pronunciation: "vur-TIJ-ih-nus",
    partOfSpeech: "adjective",
    definition: "Causing or suffering from a whirling sensation; extremely steep or high.",
    etymology: "From Latin vertigo — 'dizziness', from vertere (to turn).",
    example: "She gripped the railing as she peered down the vertiginous cliff face.",
    tip: "Vertigo makes everything spin — vertiginous heights make your head swim.",
    usage: "Use it for dizzying heights, speeds, or situations that make your head spin."
  },
  {
    word: "solipsistic",
    pronunciation: "sol-ip-SIS-tik",
    partOfSpeech: "adjective",
    definition: "Preoccupied with one's own existence and views, to the exclusion of the outside world.",
    etymology: "From Latin solus (alone) + ipse (self).",
    example: "His solipsistic worldview made it impossible for him to consider anyone else's perspective.",
    tip: "Solus + ipse = only oneself. The world begins and ends with you.",
    usage: "Use it to describe someone who genuinely cannot see beyond their own experience."
  },
  {
    word: "tendentious",
    pronunciation: "ten-DEN-shus",
    partOfSpeech: "adjective",
    definition: "Promoting a particular cause or point of view; biased.",
    etymology: "From Medieval Latin tendentiosus — 'having a tendency'.",
    example: "The documentary was interesting but clearly tendentious — every interview backed the same conclusion.",
    tip: "It tends toward one direction: tendentious writing has an agenda.",
    usage: "Use it for articles, arguments, or people that are clearly pushing a viewpoint."
  },
  {
    word: "pellucid",
    pronunciation: "puh-LOO-sid",
    partOfSpeech: "adjective",
    definition: "Translucently clear; easily understood.",
    etymology: "From Latin pellucidus — 'transparent', from per (through) + lucere (to shine).",
    example: "Her pellucid explanation made a complex topic feel simple.",
    tip: "Light shines through — a pellucid explanation lets understanding shine right through.",
    usage: "Use it to praise writing or speech that is exceptionally clear and easy to understand."
  },
  {
    word: "sycophantic",
    pronunciation: "sik-uh-FAN-tik",
    partOfSpeech: "adjective",
    definition: "Behaving in an obsequious way, seeking to gain favour through flattery.",
    etymology: "From Greek sykophantes — 'informer, slanderer', later 'flatterer'.",
    example: "The sycophantic assistant agreed with every word his boss said.",
    tip: "A sycophant tells you only what you want to hear — dangerously agreeable.",
    usage: "Use it to call out empty flattery or people who only say what the boss wants."
  },
  {
    word: "obstreperous",
    pronunciation: "ob-STREP-er-us",
    partOfSpeech: "adjective",
    definition: "Noisy and difficult to control; stubbornly resistant.",
    etymology: "From Latin obstreperus — 'clamorous', from ob (against) + strepere (to make noise).",
    example: "The obstreperous crowd had to be calmed before the speaker could continue.",
    tip: "Strepere = noise. Obstreperous people make noise against anything in their way.",
    usage: "Use it for unruly crowds, difficult children, or anyone making a loud fuss."
  },
  {
    word: "equanimity",
    pronunciation: "ee-kwuh-NIM-ih-tee",
    partOfSpeech: "noun",
    definition: "Mental calmness and composure, especially in difficult situations.",
    etymology: "From Latin aequanimitas — 'evenness of mind', from aequus (equal) + animus (mind).",
    example: "She handled the catastrophic news with remarkable equanimity.",
    tip: "Aequus + animus = a level mind. Equanimity is your internal equilibrium.",
    usage: "Use it to praise someone who stays calm and composed under pressure."
  },
  {
    word: "inveterate",
    pronunciation: "in-VET-er-ut",
    partOfSpeech: "adjective",
    definition: "Having a habit or interest so long-established that it is unlikely to change.",
    etymology: "From Latin inveteratus — 'long-established', from in + vetus (old).",
    example: "An inveterate traveller, she had never lived in the same city for more than two years.",
    tip: "Vetus = old. An inveterate habit is so old it's baked in.",
    usage: "Use it for deeply ingrained habits, hobbies, or personalities."
  },
  {
    word: "circumlocution",
    pronunciation: "sur-kum-loh-KYOO-shun",
    partOfSpeech: "noun",
    definition: "The use of many words where fewer would do; evasive talk.",
    etymology: "From Latin circumlocutio — 'a speaking around', from circum (around) + loqui (to speak).",
    example: "His three-paragraph circumlocution was his way of saying 'I don't know'.",
    tip: "Circum = around, loqui = speak. Talking in circles to avoid the point.",
    usage: "Use it when someone takes the scenic route to a simple answer."
  },
  {
    word: "recherché",
    pronunciation: "ruh-SHER-shay",
    partOfSpeech: "adjective",
    definition: "Rare and exotic; exquisitely chosen; obscure and pretentious.",
    etymology: "From French rechercher — 'to seek out carefully'.",
    example: "His playlist was full of recherché bands most people had never heard of.",
    tip: "Carefully sought out — but so niche it can tip into pretentious.",
    usage: "Use it (with a slight smirk) for anything deliberately obscure or rarefied."
  },
  {
    word: "fulgent",
    pronunciation: "FUL-jent",
    partOfSpeech: "adjective",
    definition: "Shining brilliantly; radiant.",
    etymology: "From Latin fulgens — 'shining', from fulgere (to shine).",
    example: "The fulgent morning sun lit the whole valley gold.",
    tip: "Fulgere = to flash or shine. A fulgent smile lights up a room.",
    usage: "Use it as a vivid alternative to 'brilliant' or 'radiant'."
  },
  {
    word: "apothegm",
    pronunciation: "AP-uh-them",
    partOfSpeech: "noun",
    definition: "A short, witty, instructive saying.",
    etymology: "From Greek apophthegma — 'something clearly spoken', from apo + phthengesthai (to utter).",
    example: "'Done is better than perfect' is the apothegm of the startup world.",
    tip: "Shorter and punchier than an aphorism — a quip that teaches.",
    usage: "Use it when someone drops a piece of wisdom in a memorable one-liner."
  },
  {
    word: "nugatory",
    pronunciation: "NOO-guh-tor-ee",
    partOfSpeech: "adjective",
    definition: "Of no value or importance; futile.",
    etymology: "From Latin nugatorius — 'trifling', from nugari (to trifle).",
    example: "The committee's objections proved nugatory — the decision had already been made.",
    tip: "Nuga = trifles. Nugatory things are trifling, worthless.",
    usage: "Use it for arguments, efforts, or rules that amount to nothing."
  },
  {
    word: "serendipity",
    pronunciation: "ser-en-DIP-ih-tee",
    partOfSpeech: "noun",
    definition: "The occurrence and development of events by chance in a happy or beneficial way.",
    etymology: "Coined by Horace Walpole in 1754, from the Persian fairy tale 'The Three Princes of Serendip'.",
    example: "By pure serendipity, she bumped into the very person who'd offer her the job.",
    tip: "Named after an old name for Sri Lanka — three princes who made lucky discoveries by accident.",
    usage: "Use it for happy accidents and fortunate coincidences."
  },
  {
    word: "meretricious",
    pronunciation: "mer-ih-TRISH-us",
    partOfSpeech: "adjective",
    definition: "Apparently attractive but having in reality no value or integrity; falsely alluring.",
    etymology: "From Latin meretricius — 'of a prostitute', from meretrix (one who earns money).",
    example: "The film was full of meretricious special effects that couldn't hide its weak story.",
    tip: "Shiny on the surface, hollow underneath — all glitter, no gold.",
    usage: "Use it for flashy things that look good but don't hold up under scrutiny."
  },
  {
    word: "internecine",
    pronunciation: "in-ter-NEE-syn",
    partOfSpeech: "adjective",
    definition: "Destructive to both sides; relating to conflict within a group.",
    etymology: "From Latin internecinus — 'of mutual slaughter', from inter + necare (to kill).",
    example: "The internecine rivalry between departments was draining the whole company.",
    tip: "Both sides lose. An internecine conflict destroys the very group fighting it.",
    usage: "Use it for internal political fights or feuds that hurt everyone involved."
  },
  {
    word: "vitiate",
    pronunciation: "VISH-ee-ayt",
    partOfSpeech: "verb",
    definition: "To impair the quality or efficiency of; to make faulty or defective.",
    etymology: "From Latin vitiare — 'to make faulty', from vitium (fault).",
    example: "One forged document was enough to vitiate the entire legal agreement.",
    tip: "Vitium = fault. To vitiate something is to inject a fatal flaw.",
    usage: "Use it when one flaw corrupts or undermines something otherwise solid."
  },
  {
    word: "crepuscular",
    pronunciation: "krih-PUS-kyoo-ler",
    partOfSpeech: "adjective",
    definition: "Relating to twilight; active during twilight hours.",
    etymology: "From Latin crepusculum — 'twilight', from creper (dusky).",
    example: "Deer are crepuscular animals — most active at dawn and dusk.",
    tip: "Crepusculum = twilight. The soft, grey world between day and night.",
    usage: "Use it to describe that atmospheric in-between light, or animals that love it."
  },
  {
    word: "salubrious",
    pronunciation: "suh-LOO-bree-us",
    partOfSpeech: "adjective",
    definition: "Health-giving; pleasant; not run-down.",
    etymology: "From Latin salubris — 'healthful', from salus (health).",
    example: "They moved to a more salubrious part of town after the kids were born.",
    tip: "Salus = health. Salubrious places are wholesome, clean, and good for you.",
    usage: "Use it to describe fresh air, healthy environments, or a nice neighbourhood."
  },
  {
    word: "excoriate",
    pronunciation: "eks-KOR-ee-ayt",
    partOfSpeech: "verb",
    definition: "To criticize severely; to censure harshly.",
    etymology: "From Latin excoriare — 'to strip of skin', from ex + corium (hide, skin).",
    example: "The review excoriated the restaurant, calling it 'a crime against cuisine'.",
    tip: "Literally means to flay — a scathing critique that strips away the surface.",
    usage: "Use it for truly devastating reviews or dressing-downs."
  },
  {
    word: "umbrage",
    pronunciation: "UM-brij",
    partOfSpeech: "noun",
    definition: "Offence or annoyance; a feeling of being slighted.",
    etymology: "From Latin umbra — 'shadow', via French ombrage (shade, suspicion).",
    example: "She took umbrage at the suggestion that she couldn't handle the project.",
    tip: "To 'take umbrage' is to feel the shadow of insult fall over you.",
    usage: "Use it in the classic phrase 'take umbrage' when someone feels wrongly slighted."
  },
  {
    word: "penurious",
    pronunciation: "peh-NYOOR-ee-us",
    partOfSpeech: "adjective",
    definition: "Extremely poor; unwilling to spend money; miserly.",
    etymology: "From Latin penuria — 'scarcity, want'.",
    example: "Despite his wealth, he lived a penurious lifestyle, rarely spending a cent.",
    tip: "Penuria = scarcity. Penurious can mean actually poor, or just acting poor.",
    usage: "Use it for someone who is either destitute or excessively tight-fisted."
  },
  {
    word: "grandiloquent",
    pronunciation: "gran-DIL-oh-kwent",
    partOfSpeech: "adjective",
    definition: "Using pompous or extravagant language; bombastic.",
    etymology: "From Latin grandiloquus — 'speaking grandly', from grandis (grand) + loqui (to speak).",
    example: "His grandiloquent speech was full of big words that said very little.",
    tip: "Grand + loqui (speak) = speaking as if you're addressing an empire.",
    usage: "Use it for speeches or writing that is impressively worded but ultimately hollow."
  },
  {
    word: "fecund",
    pronunciation: "FEE-kund",
    partOfSpeech: "adjective",
    definition: "Producing many offspring or new ideas; highly fertile or productive.",
    etymology: "From Latin fecundus — 'fruitful', related to fetus.",
    example: "She was a fecund writer — publishing three novels in a single year.",
    tip: "Think: fecund fields that produce abundant harvests.",
    usage: "Use it for prolific artists, thinkers, or anything that generates abundantly."
  },
  {
    word: "recusant",
    pronunciation: "REK-yoo-zunt",
    partOfSpeech: "noun / adjective",
    definition: "A person who refuses to submit to authority or comply with a regulation.",
    etymology: "From Latin recusare — 'to refuse', from re- + causa (reason, cause).",
    example: "He was a quiet recusant, refusing to sign any document he disagreed with.",
    tip: "Re + causa = refusing on principle. A recusant won't bend.",
    usage: "Use it for principled non-compliance — refusing on moral or conscientious grounds."
  },
  {
    word: "vituperate",
    pronunciation: "vy-TOO-per-ayt",
    partOfSpeech: "verb",
    definition: "To blame or insult someone in strong or violent language.",
    etymology: "From Latin vituperare — 'to blame', from vitium (fault) + parare (to prepare).",
    example: "He vituperated against the referee for ten minutes after the final whistle.",
    tip: "Vitium = fault + parare = prepare. Prepared to list every fault loudly.",
    usage: "Use it for an especially passionate, loud, or prolonged verbal attack."
  },
  {
    word: "luculent",
    pronunciation: "LOO-kyoo-lent",
    partOfSpeech: "adjective",
    definition: "Clearly expressed; bright and luminous.",
    etymology: "From Latin luculentus — 'full of light', from lux (light).",
    example: "A luculent argument that left no room for doubt.",
    tip: "Lux = light. A luculent explanation is one that illuminates.",
    usage: "Use it as a more vivid synonym for 'clear' or 'compelling' in a speech or essay."
  },
  {
    word: "scintilla",
    pronunciation: "sin-TIL-uh",
    partOfSpeech: "noun",
    definition: "A tiny trace or spark of a specified quality or feeling.",
    etymology: "From Latin scintilla — 'spark'.",
    example: "There wasn't a scintilla of evidence to support the claim.",
    tip: "A spark so small you can barely see it — a scintilla is the least possible amount.",
    usage: "Use it for a tiny trace of something — often in the negative ('not a scintilla')."
  },
  {
    word: "minatory",
    pronunciation: "MIN-uh-tor-ee",
    partOfSpeech: "adjective",
    definition: "Expressing or conveying a threat.",
    etymology: "From Latin minatorius — 'threatening', from minari (to threaten).",
    example: "A minatory letter arrived from the landlord about unpaid rent.",
    tip: "Minari = to threaten. A minatory tone is one that makes your stomach drop.",
    usage: "Use it for communications or looks that carry an unmistakable threat."
  },
  {
    word: "oleaginous",
    pronunciation: "oh-lee-AJ-ih-nus",
    partOfSpeech: "adjective",
    definition: "Rich in, covered with, or producing oil; unpleasantly smooth and ingratiating.",
    etymology: "From Latin oleaginus — 'of the olive', from oleum (oil).",
    example: "His oleaginous charm made everyone uneasy — you couldn't quite trust him.",
    tip: "Oily in manner — slippery, too smooth to get a grip on.",
    usage: "Use it for people who are slick and charming in a way that feels fake."
  },
  {
    word: "sesquipedalian",
    pronunciation: "ses-kwi-puh-DAY-lee-un",
    partOfSpeech: "adjective",
    definition: "Given to or characterized by the use of long words; (of a word) long.",
    etymology: "From Latin sesquipedalis — 'a foot and a half long', used by Horace for pompous words.",
    example: "His sesquipedalian vocabulary often left his audience reaching for a dictionary.",
    tip: "A word about long words that is itself a long word — Horace's joke survives.",
    usage: "Use it (with affection or irony) for anyone who loves unnecessarily long words."
  },
  {
    word: "pernicious",
    pronunciation: "per-NISH-us",
    partOfSpeech: "adjective",
    definition: "Having a harmful effect, especially in a gradual or subtle way.",
    etymology: "From Latin perniciosus — 'destructive', from pernicies (ruin).",
    example: "The pernicious myth that success requires suffering does real damage.",
    tip: "Pernicious harms slowly and quietly, like rust on iron.",
    usage: "Use it for subtle, creeping harms — attitudes, habits, or ideas that corrode over time."
  },
  {
    word: "turpitude",
    pronunciation: "TUR-pih-tyood",
    partOfSpeech: "noun",
    definition: "Wickedness and moral depravity; shameful vice.",
    etymology: "From Latin turpitudo — 'baseness', from turpis (base, foul).",
    example: "The scandal revealed a pattern of moral turpitude that shocked even his allies.",
    tip: "Turpis = foul. Turpitude is depravity — not just bad behaviour, but corrupt character.",
    usage: "Use it (especially in 'moral turpitude') for serious ethical wrongdoing."
  },
  {
    word: "sylvan",
    pronunciation: "SIL-van",
    partOfSpeech: "adjective",
    definition: "Consisting of or associated with woods; pleasantly rural and pastoral.",
    etymology: "From Latin silva — 'forest', via Silvanus (Roman god of forests).",
    example: "They escaped the city for a sylvan retreat in the mountains.",
    tip: "Silva = forest. Sylvan conjures sunlit clearings and birdsong.",
    usage: "Use it to describe a peaceful, wooded, or idyllically rural scene."
  },
  {
    word: "halcyon",
    pronunciation: "HAL-see-un",
    partOfSpeech: "adjective",
    definition: "Denoting a period of time in the past that was idyllically happy and peaceful.",
    etymology: "From the halcyon bird (kingfisher), which ancient Greeks believed calmed winter seas.",
    example: "She looked back on her university years as a halcyon time.",
    tip: "The kingfisher was said to nest on the sea, calming the waves — hence calm, golden days.",
    usage: "Use it for looking back on a peaceful, golden era in life."
  },
  {
    word: "concatenate",
    pronunciation: "kon-KAT-en-ayt",
    partOfSpeech: "verb",
    definition: "To link things together in a chain or series.",
    etymology: "From Latin concatenare — 'to chain together', from catena (chain).",
    example: "A series of small misfortunes concatenated into a genuine crisis.",
    tip: "Catena = chain. To concatenate is to hook one thing to the next.",
    usage: "Use it (beyond coding) to describe a chain of events, ideas, or decisions."
  },
  {
    word: "complaisant",
    pronunciation: "kum-PLAY-zunt",
    partOfSpeech: "adjective",
    definition: "Willing to please or comply; showing a cheerful desire to accommodate.",
    etymology: "From French complaire — 'to please', from Latin complacere.",
    example: "A complaisant host, he adjusted the evening's plan the moment guests arrived.",
    tip: "Different from 'complacent' — complaisant is actively pleasant, not passively smug.",
    usage: "Use it for someone who helpfully and cheerfully adapts to others."
  },
  {
    word: "probity",
    pronunciation: "PROH-bih-tee",
    partOfSpeech: "noun",
    definition: "The quality of having strong moral principles; complete honesty and integrity.",
    etymology: "From Latin probitas — 'uprightness', from probus (good, honest).",
    example: "Her reputation for probity made her the obvious choice to lead the inquiry.",
    tip: "Probus = honest. Probity is beyond just honesty — it's unimpeachable character.",
    usage: "Use it to describe someone of genuinely unquestionable integrity."
  },
  {
    word: "piquant",
    pronunciation: "PEE-kunt",
    partOfSpeech: "adjective",
    definition: "Having a pleasantly sharp taste or appetising flavour; pleasantly stimulating.",
    etymology: "From French piquer — 'to prick, sting', from Latin pungere.",
    example: "The story had a piquant irony: the fraud investigator was himself under investigation.",
    tip: "A piquant flavour has a nice bite to it — so does a piquant detail in a story.",
    usage: "Use it for food with a pleasing sharpness, or situations with an intriguing edge."
  },
  {
    word: "cogent",
    pronunciation: "KOH-jent",
    partOfSpeech: "adjective",
    definition: "Clear, logical, and convincing.",
    etymology: "From Latin cogentem — 'compelling', from cogere (to compel).",
    example: "She made a cogent case for reducing the budget, and no one disagreed.",
    tip: "Cogere = to compel. A cogent argument compels you to agree.",
    usage: "Use it to describe an argument so well-reasoned it's hard to resist."
  },
  {
    word: "luminary",
    pronunciation: "LOO-mih-nair-ee",
    partOfSpeech: "noun",
    definition: "A person who inspires or influences others; a notable or eminent person.",
    etymology: "From Latin luminarius — 'of light', from lumen (light).",
    example: "The conference drew luminaries from across the scientific community.",
    tip: "A luminary lights the way for others, like a star in the intellectual sky.",
    usage: "Use it to describe someone whose work or ideas genuinely illuminates a field."
  },
  {
    word: "calumniate",
    pronunciation: "kuh-LUM-nee-ayt",
    partOfSpeech: "verb",
    definition: "To make false and defamatory statements about someone.",
    etymology: "From Latin calumniari — 'to accuse falsely', from calumnia (slander).",
    example: "Political rivals tried to calumniate him, but the truth eventually prevailed.",
    tip: "Calumnia = false accusation. To calumniate is to slander with deliberate falsehood.",
    usage: "Use it when someone is being actively and dishonestly smeared."
  },
  {
    word: "effulgent",
    pronunciation: "ih-FUL-jent",
    partOfSpeech: "adjective",
    definition: "Radiant; shining brilliantly.",
    etymology: "From Latin effulgere — 'to shine out', from ex + fulgere (to shine).",
    example: "An effulgent sunset turned the whole horizon orange and gold.",
    tip: "Fulgere = to flash. Effulgent is fulgent turned up — shining out in all directions.",
    usage: "Use it for something brilliantly, radiantly bright — or a smile that lights a room."
  },
  {
    word: "numinous",
    pronunciation: "NOO-mih-nus",
    partOfSpeech: "adjective",
    definition: "Having a strong religious or spiritual quality; evoking a sense of the divine.",
    etymology: "From Latin numen — 'divine power or presence'.",
    example: "There was something numinous about standing in that ancient cathedral.",
    tip: "Numen = divine will. A numinous experience makes you feel something vast and beyond yourself.",
    usage: "Use it for places, music, or moments that feel transcendent or spiritually charged."
  },
  {
    word: "jejune",
    pronunciation: "jih-JOON",
    partOfSpeech: "adjective",
    definition: "Naive and simplistic; lacking interest or significance; dull.",
    etymology: "From Latin jejunus — 'fasting, empty', hence empty of content.",
    example: "His jejune analysis impressed no one familiar with the subject.",
    tip: "Jejune originally meant 'starved' — jejune ideas are empty, underfed, thin.",
    usage: "Use it for ideas or arguments that are naively simple or disappointingly shallow."
  },
  {
    word: "vitiate",
    pronunciation: "VISH-ee-ayt",
    partOfSpeech: "verb",
    definition: "To impair or weaken; to make legally invalid.",
    etymology: "From Latin vitiare — 'to make faulty', from vitium (fault).",
    example: "The undisclosed conflict of interest vitiates the entire report.",
    tip: "One crack can vitiate the whole structure — it means to corrupt or invalidate.",
    usage: "Use it in legal, ethical, or practical contexts where one flaw ruins everything."
  },
  {
    word: "impecunious",
    pronunciation: "im-pih-KYOO-nee-us",
    partOfSpeech: "adjective",
    definition: "Having very little or no money; chronically broke.",
    etymology: "From Latin im- (not) + pecunia (money, cattle — wealth was once measured in cattle).",
    example: "He lived like a prince despite being thoroughly impecunious.",
    tip: "Pecunia = money (from pecus, cattle). Impecunious = without even a cow to your name.",
    usage: "Use it as an elegant way to say someone is flat broke."
  },
  {
    word: "querulous",
    pronunciation: "KWER-yoo-lus",
    partOfSpeech: "adjective",
    definition: "Complaining in a petulant or whining manner.",
    etymology: "From Latin querulosus — 'full of complaints', from queri (to complain).",
    example: "A querulous email arrived at 7am, complaining about the font on the slide.",
    tip: "Queri = to complain. A querulous person is always finding fault.",
    usage: "Use it for persistent, low-level complaining — the chronic grumbler."
  },
  {
    word: "tendentious",
    pronunciation: "ten-DEN-shus",
    partOfSpeech: "adjective",
    definition: "Expressing a particular point of view; biased toward a specific agenda.",
    etymology: "From Medieval Latin tendere — 'to tend, aim at'.",
    example: "The report was tendentious — it only cited studies that supported one conclusion.",
    tip: "It leans in one direction, like a tendentious scale that was never calibrated.",
    usage: "Use it for media, writing, or arguments that push a conclusion rather than investigate."
  },
  {
    word: "sophistry",
    pronunciation: "SOF-is-tree",
    partOfSpeech: "noun",
    definition: "The use of clever but false arguments, especially with the intent to deceive.",
    etymology: "From Greek sophistes — 'wise man', later used to describe paid teachers of rhetoric who prioritised winning over truth.",
    example: "His 'logical' argument was pure sophistry — convincing on the surface, hollow underneath.",
    tip: "The Sophists were clever but prioritised winning arguments over truth.",
    usage: "Use it when an argument sounds logical but is designed to mislead."
  },
  {
    word: "anodyne",
    pronunciation: "AN-uh-dyne",
    partOfSpeech: "adjective",
    definition: "Not likely to cause offence or disagreement; bland. Also: painkilling.",
    etymology: "From Greek anodynos — 'free from pain', from an- (without) + odyne (pain).",
    example: "The politician's anodyne statement managed to say nothing whatsoever.",
    tip: "Originally a painkiller — an anodyne statement removes all the sharp edges.",
    usage: "Use it for deliberately inoffensive but ultimately meaningless statements."
  },
  {
    word: "hubris",
    pronunciation: "HYOO-bris",
    partOfSpeech: "noun",
    definition: "Excessive pride or self-confidence, especially when it leads to downfall.",
    etymology: "From Greek hybris — 'insolence, outrage', often describing defiance of the gods.",
    example: "His hubris in assuming he couldn't lose cost him the entire election.",
    tip: "In Greek tragedy, hubris was the fatal flaw — pride so great it invites catastrophe.",
    usage: "Use it for overconfidence that plants the seeds of its own destruction."
  },
  {
    word: "apotheosis",
    pronunciation: "uh-poth-ee-OH-sis",
    partOfSpeech: "noun",
    definition: "The highest point; the culmination or ideal example of something.",
    etymology: "From Greek apotheoun — 'to deify', from apo + theos (god).",
    example: "The final movement is the apotheosis of the entire symphony.",
    tip: "To be apotheosized was to be made a god — the apotheosis of anything is its most divine form.",
    usage: "Use it for the pinnacle moment of a career, work, or idea."
  },
  {
    word: "abstemious",
    pronunciation: "ab-STEE-mee-us",
    partOfSpeech: "adjective",
    definition: "Not self-indulgent; moderate in eating and drinking.",
    etymology: "From Latin abstemius — 'abstaining from wine', from abs (from) + temetum (strong drink).",
    example: "He was abstemious by nature — one glass of wine and a light meal was always enough.",
    tip: "Abs + temetum (wine). The original use was about not drinking, now about any restraint.",
    usage: "Use it to describe someone admirably restrained in their appetites."
  },
  {
    word: "pugnacious",
    pronunciation: "pug-NAY-shus",
    partOfSpeech: "adjective",
    definition: "Eager or quick to argue, quarrel, or fight.",
    etymology: "From Latin pugnax — 'fond of fighting', from pugnus (fist).",
    example: "The pugnacious lawyer had a reputation for picking fights in every deposition.",
    tip: "Pugnus = fist. A pugnacious person leads with their fists — literal or figurative.",
    usage: "Use it for someone who is combative and always looking for a fight."
  },
  {
    word: "dilettante",
    pronunciation: "DIL-ih-tont",
    partOfSpeech: "noun",
    definition: "A person who cultivates an area of interest without real commitment or skill; an amateur.",
    etymology: "From Italian dilettante — 'one who delights in', from dilettare (to delight).",
    example: "He dabbled in painting, sculpture, and writing — a charming dilettante with no masterpiece.",
    tip: "Originally flattering — someone who delights in art. Now implies pleasant but shallow.",
    usage: "Use it for someone who dabbles widely but never goes deep."
  },
  {
    word: "redolent",
    pronunciation: "RED-uh-lent",
    partOfSpeech: "adjective",
    definition: "Strongly reminiscent or suggestive of; having a pleasant strong scent.",
    etymology: "From Latin redolere — 'to emit scent', from re- + olere (to smell).",
    example: "The old library was redolent of wood polish and faded ambition.",
    tip: "Olere = to smell. Something redolent carries the scent — real or figurative — of something else.",
    usage: "Use it when a place, phrase, or idea strongly evokes something else."
  },
  {
    word: "cavil",
    pronunciation: "KAV-il",
    partOfSpeech: "verb / noun",
    definition: "To raise trivial objections; a trivial objection.",
    etymology: "From Latin cavillari — 'to jeer, scoff', from cavilla (raillery).",
    example: "He cavilled endlessly about the font size while the actual content went unchecked.",
    tip: "To cavil is to pick at details while missing the point entirely.",
    usage: "Use it for nitpicking objections that miss the bigger picture."
  },
  {
    word: "parlous",
    pronunciation: "PAR-lus",
    partOfSpeech: "adjective",
    definition: "Full of danger or uncertainty; precarious.",
    etymology: "Middle English contraction of 'perilous'.",
    example: "The company found itself in a parlous financial state by end of year.",
    tip: "Old form of 'perilous' — it has an antique ring that underscores the gravity of the danger.",
    usage: "Use it to describe a situation that is genuinely dangerous or precarious."
  },
  {
    word: "phlegmatic",
    pronunciation: "fleg-MAT-ik",
    partOfSpeech: "adjective",
    definition: "Having an unemotional and stolidly calm disposition.",
    etymology: "From Greek phlegma — 'inflammation, phlegm', one of the four medieval humours thought to cause calm.",
    example: "A phlegmatic surgeon who never raised her voice even in the most chaotic emergencies.",
    tip: "The medieval 'phlegm' humour was cold and moist — it was thought to make you calm and slow.",
    usage: "Use it to describe someone unflappably, sometimes frustratingly, calm."
  },
  {
    word: "concomitant",
    pronunciation: "kon-KOM-ih-tant",
    partOfSpeech: "adjective / noun",
    definition: "Naturally accompanying or associated with; a phenomenon that accompanies another.",
    etymology: "From Latin concomitari — 'to accompany', from com- + comes (companion).",
    example: "The concomitant rise in housing costs made the city unliveable for young people.",
    tip: "Com + comes = travelling with a companion. A concomitant thing comes along for the ride.",
    usage: "Use it for effects or trends that reliably accompany something else."
  },
  {
    word: "sedulous",
    pronunciation: "SEJ-oo-lus",
    partOfSpeech: "adjective",
    definition: "Showing dedication and diligence; persevering.",
    etymology: "From Latin sedulus — 'busy, diligent', perhaps from se dolo (without deception).",
    example: "Years of sedulous practice had made her the finest cellist in the region.",
    tip: "Sedulous diligence is quiet and persistent — not flashy, just deeply committed.",
    usage: "Use it to praise someone whose hard work is consistent and undramatic."
  },
  {
    word: "inimical",
    pronunciation: "ih-NIM-ih-kul",
    partOfSpeech: "adjective",
    definition: "Tending to obstruct or harm; hostile or unfriendly.",
    etymology: "From Latin inimicus — 'enemy', from in- (not) + amicus (friend).",
    example: "The culture of secrecy was inimical to any real reform.",
    tip: "Inimicus = enemy. Inimical forces work against you, not just passively — actively hostile.",
    usage: "Use it for conditions, attitudes, or people that actively work against something."
  },
  {
    word: "tenebrous",
    pronunciation: "TEN-uh-brus",
    partOfSpeech: "adjective",
    definition: "Dark, shadowy, or obscure.",
    etymology: "From Latin tenebrosus — 'full of darkness', from tenebrae (darkness).",
    example: "The tenebrous alley stretched ahead, unlit and silent.",
    tip: "Tenebrae = darkness. Tenebrous conjures a heavy, shadowy, Gothic kind of dark.",
    usage: "Use it for atmospherically dark places, moods, or ideas."
  },
  {
    word: "perfidious",
    pronunciation: "per-FID-ee-us",
    partOfSpeech: "adjective",
    definition: "Deceitful and untrustworthy; guilty of betrayal.",
    etymology: "From Latin perfidiosus — 'treacherous', from perfidia (faithlessness).",
    example: "A perfidious ally is more dangerous than an honest enemy.",
    tip: "Per + fides (faith) = betraying faith. Perfidious is loyalty broken from within.",
    usage: "Use it for betrayal — allies who turn, promises broken, trust violated."
  }
];

// Get today's word based on the calendar date (+ optional dev offset)
function getTodayWord() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const offset = parseInt(localStorage.getItem('wordsmith_offset') || '0', 10);
  return WORDS[(dayOfYear + offset) % WORDS.length];
}

// Get a word for a specific past date (days ago)
function getWordForDate(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return WORDS[dayOfYear % WORDS.length];
}
