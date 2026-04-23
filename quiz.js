// Quiz data: for each word, 4 sentences where only one uses the word correctly.
// `correct` is the 0-based index of the right answer.
// Wrong answers are subtly plausible — wrong register, inverted meaning, wrong sense, or non-sequitur context.

const QUIZ = {
  "sanguine": {
    correct: 2,
    sentences: [
      "The doctor's sanguine expression told us immediately that the news would be grave.",
      "She felt sanguine about finding a parking spot on a busy Saturday — it was, after all, a small thing.",
      "Despite three failed attempts, he remained sanguine about eventually getting his novel published.",
      "His sanguine temperament made him prone to anxiety and persistent self-doubt."
    ],
    explanation: "Sanguine means optimistic in the face of difficulty. Option A inverts this (grave news ≠ sanguine expression). Option B applies it too trivially. Option D confuses it with its opposite."
  },
  "laconic": {
    correct: 3,
    sentences: [
      "His laconic memoir filled eight hundred pages with vivid, expansive recollections.",
      "She gave a laconic apology, spending twenty minutes carefully explaining each of her reasons.",
      "The laconic speech was so detailed that the audience was still taking notes an hour later.",
      "When asked why he quit, his laconic reply — 'Done.' — ended the conversation."
    ],
    explanation: "Laconic means using very few words. Options A, B, and C all describe lengthy or detailed communication, which is the opposite."
  },
  "mellifluous": {
    correct: 1,
    sentences: [
      "The mellifluous smell of fresh bread drifted from the bakery into the street.",
      "The radio host's mellifluous voice kept listeners tuned in long past midnight.",
      "Her mellifluous argument convinced the board to reverse their decision.",
      "The mellifluous texture of the velvet felt luxurious beneath her fingertips."
    ],
    explanation: "Mellifluous describes sound — sweet or musical to hear. Options A and D apply it to smell and touch. Option C applies it to logical persuasion, not sound."
  },
  "ephemeral": {
    correct: 0,
    sentences: [
      "The ephemeral glow of a shooting star was gone before she could point it out.",
      "Their ephemeral friendship endured thirty years of letters, visits, and shared grief.",
      "The ephemeral mountain range had stood for two hundred million years.",
      "He built an ephemeral reputation as the city's most dependable builder — one that lasted decades."
    ],
    explanation: "Ephemeral means lasting a very short time. Options B (thirty years), C (two hundred million years), and D (lasting decades) all describe things that endure — the opposite of ephemeral."
  },
  "perspicacious": {
    correct: 1,
    sentences: [
      "A perspicacious listener, she could follow every step of a dense academic lecture without effort.",
      "She was perspicacious enough to sense the tension in the room before a single word was spoken.",
      "The perspicacious child memorised all fifty state capitals in a single afternoon.",
      "His perspicacious vision allowed him to read the fine print without glasses."
    ],
    explanation: "Perspicacious means having sharp insight and perception. Option A describes attentive listening. Options C and D describe memory and eyesight — none of which capture the word's sense of reading beneath the surface."
  },
  "loquacious": {
    correct: 2,
    sentences: [
      "The loquacious email was a single, decisive line: 'Confirmed.'",
      "She became loquacious at parties, preferring to observe from the sidelines.",
      "He grew more loquacious after a glass of wine, holding court for the rest of the evening.",
      "Unusually loquacious for someone who loved conversation, he refused every interview request."
    ],
    explanation: "Loquacious means tending to talk a great deal. Options A (one line), B (preferring to observe), and D (refusing interviews) all contradict this."
  },
  "propitious": {
    correct: 3,
    sentences: [
      "A black cat crossing their path felt like a propitious sign before launching the business.",
      "The propitious storm destroyed everything they had grown that summer.",
      "She chose a propitious moment to deliver the bad news — right as the board meeting began.",
      "With a new backer secured and sales climbing, the moment felt genuinely propitious."
    ],
    explanation: "Propitious means favourably timed or indicating good outcomes. Option A (black cat = bad omen), Option B (destruction), and Option C (bad news at a board meeting) all describe unfavourable circumstances."
  },
  "truculent": {
    correct: 1,
    sentences: [
      "The truculent puppy greeted every visitor with a wagging tail and immediate trust.",
      "The truculent suspect refused every question until his lawyer arrived.",
      "Her truculent manner made her the go-to mediator whenever disputes broke out.",
      "After an hour of yoga, he felt truculent — at peace with the world and everyone in it."
    ],
    explanation: "Truculent means defiant, combative, quick to fight. Options A (friendly puppy), C (trusted mediator), and D (peaceful after yoga) all describe the opposite disposition."
  },
  "desultory": {
    correct: 0,
    sentences: [
      "They made desultory conversation at the bus stop, wandering from the weather to films to nothing in particular.",
      "Her desultory preparation for the marathon — six days a week for six months — paid off.",
      "The desultory surgeon worked with meticulous focus through a seven-hour procedure.",
      "The company's desultory growth — up forty percent for the fifth consecutive year — impressed every analyst."
    ],
    explanation: "Desultory means lacking purpose or plan. Options B (intense six-day training), C (meticulous focus), and D (consistent 40% growth) all describe the opposite of aimlessness."
  },
  "recondite": {
    correct: 2,
    sentences: [
      "Her recondite taste in music ran to whatever was currently topping the charts.",
      "The professor's recondite lecture on climate science drew the largest crowd of the semester.",
      "His thesis explored the recondite world of medieval Byzantine coinage — known to almost no one.",
      "She had a recondite knowledge of football: every team, every match, every statistic."
    ],
    explanation: "Recondite means obscure, known by very few. Option A (top of the charts = popular), Option B (largest crowd ≠ obscure), and Option D (football is widely known) all describe the opposite."
  },
  "quotidian": {
    correct: 3,
    sentences: [
      "Landing on the moon was a quotidian achievement for the crew — routine and unremarkable.",
      "The quotidian ceremony was held only once every hundred years.",
      "The quotidian disaster struck without warning, devastating the region for generations.",
      "She found quiet pleasure in the quotidian rituals of tea, the crossword, and a short walk."
    ],
    explanation: "Quotidian means everyday, ordinary, recurring daily. Option A (landing on the moon), Option B (once a century), and Option C (a disaster that devastates for generations) are all the opposite of ordinary."
  },
  "liminal": {
    correct: 2,
    sentences: [
      "The mountain summit was a liminal space — firmly established, immovable, definitively there.",
      "The team's liminal victory was decisive: no doubt, no contest.",
      "The weeks between leaving one job and starting another felt suspended — genuinely liminal.",
      "Her liminal popularity made her the undisputed front-runner in every poll."
    ],
    explanation: "Liminal means in-between, transitional, on a threshold. A summit (Option A) is a definite destination, not a threshold. A decisive victory (Option B) and being an undisputed front-runner (Option D) are settled states, not in-between ones."
  },
  "palimpsest": {
    correct: 1,
    sentences: [
      "The palimpsest was remarkable for being written in a single sitting, with no trace of any revision.",
      "The city was a palimpsest — Roman arches beneath medieval lanes beneath glass-and-steel towers.",
      "She palimpsested the document carefully, erasing every trace of what had come before.",
      "His palimpsest memory meant every new experience wiped the previous one completely clean."
    ],
    explanation: "A palimpsest shows visible traces of earlier layers. Option A (no revision, no trace) contradicts this. Option C misuses it as a verb meaning the opposite. Option D (wiping everything clean) is the reverse of retaining traces."
  },
  "fungible": {
    correct: 0,
    sentences: [
      "Currency is fungible — a ten-pound note buys exactly as much as ten individual one-pound coins.",
      "Her unique expertise made her the most fungible member of the team — impossible to replace.",
      "Trust is highly fungible: once built with one person, it transfers easily to any other.",
      "The fungible sculpture commanded a record price precisely because no copy could substitute for it."
    ],
    explanation: "Fungible means interchangeable. Option B (unique, impossible to replace) is the opposite. Option C (trust is specifically not interchangeable — it's personal). Option D contradicts itself: something irreplaceable is not fungible."
  },
  "enervate": {
    correct: 3,
    sentences: [
      "The morning run enervated her, leaving her sharp and energised for the day ahead.",
      "He used music to enervate the crowd, lifting their spirits before the keynote.",
      "The new policy enervated the team, sparking a burst of creativity and output.",
      "Three consecutive all-nighters had enervated him to the point of barely being able to speak."
    ],
    explanation: "Enervate means to drain of energy or weaken. Options A, B, and C all describe energising or lifting effects — the opposite."
  },
  "garrulous": {
    correct: 1,
    sentences: [
      "The garrulous monk maintained a strict vow of silence from dawn to dusk.",
      "The garrulous taxi driver had covered his entire life story before we cleared the first junction.",
      "Her garrulous report — two lean paragraphs — went straight to the point.",
      "Known for being garrulous, he communicated exclusively through handwritten notes."
    ],
    explanation: "Garrulous means excessively talkative, especially about trivial things. Options A (vow of silence), C (two paragraphs, straight to the point), and D (handwritten notes only) all contradict this."
  },
  "reticent": {
    correct: 2,
    sentences: [
      "She was so reticent about her past that she shared the full story with anyone who asked.",
      "The reticent politician dominated every press conference, speaking at length on every question.",
      "He was reticent about his illness — only his closest family knew.",
      "Reticent by nature, she maintained a blog where she published her thoughts for thousands of readers."
    ],
    explanation: "Reticent means reserved, not revealing one's thoughts readily. Options A (shares with anyone), B (dominates press conferences), and D (publishes thoughts publicly) all describe the opposite."
  },
  "vertiginous": {
    correct: 0,
    sentences: [
      "She gripped the railing and looked down the vertiginous cliff face — the valley floor was barely visible.",
      "The vertiginous ground floor was easy to walk to without breaking a sweat.",
      "He felt vertiginous standing in the shallow end of the paddling pool.",
      "The landscape was vertiginous in the most soothing way — a flat, calm plain to the horizon."
    ],
    explanation: "Vertiginous means causing dizziness, usually through extreme height or steepness. A ground floor (Option B), a paddling pool (Option C), and a flat plain (Option D) are all the opposite of vertiginous."
  },
  "solipsistic": {
    correct: 3,
    sentences: [
      "Her solipsistic worldview led her to consider multiple perspectives before every major decision.",
      "The solipsistic charity worker devoted herself entirely to others' needs, often forgetting her own.",
      "A solipsistic team player, she always put the group's aims ahead of her own ambitions.",
      "His solipsistic posts read as if the world began and ended with his own opinions and experiences."
    ],
    explanation: "Solipsistic means preoccupied with one's own existence to the exclusion of others. Options A, B, and C all describe genuine concern for others — the opposite."
  },
  "tendentious": {
    correct: 2,
    sentences: [
      "The tendentious report was praised for presenting every side of the debate with scrupulous balance.",
      "His tendentious analysis left everyone unsure where he stood — the conclusion could have gone either way.",
      "The documentary was tendentious — every expert, every statistic pointed toward the same predetermined conclusion.",
      "Her tendentious journalism won awards for its objectivity and reluctance to draw conclusions."
    ],
    explanation: "Tendentious means promoting a particular viewpoint, biased. Option A (scrupulous balance), Option B (conclusion unclear), and Option D (praised for objectivity) all describe the opposite."
  },
  "pellucid": {
    correct: 0,
    sentences: [
      "Her pellucid explanation of the policy left absolutely no room for confusion.",
      "The pellucid instructions required three careful readings before anyone could begin.",
      "The pellucid water at the bottom of the lake was impossible to see through.",
      "His pellucid writing style kept readers guessing at his meaning until the final page."
    ],
    explanation: "Pellucid means translucently clear, easy to understand. Options B (requires multiple readings), C (impossible to see through), and D (keeps readers guessing) all describe the opposite of clarity."
  },
  "sycophantic": {
    correct: 3,
    sentences: [
      "Her sycophantic review of the CEO's strategy was blunt and uncomfortable to read.",
      "The sycophantic film critic panned the director's latest work with devastating accuracy.",
      "She was known as sycophantic because she always said exactly what people needed to hear — even the hard truths.",
      "His sycophantic agreement with every idea the director raised made him the least trusted voice in the room."
    ],
    explanation: "Sycophantic means seeking favour through flattery. Options A (blunt), B (panned/devastating), and C (saying hard truths) all describe the opposite — honest or critical behaviour."
  },
  "obstreperous": {
    correct: 2,
    sentences: [
      "The obstreperous library was so quiet that staff communicated in whispers.",
      "His obstreperous compliance made him the easiest person to manage on the entire team.",
      "The obstreperous crowd refused to let the speaker finish a single sentence.",
      "Her obstreperous patience made every conflict resolution meeting a genuine pleasure."
    ],
    explanation: "Obstreperous means noisy and difficult to control. Options A (quiet whispers), B (easiest to manage), and D (patient) all describe the opposite."
  },
  "equanimity": {
    correct: 1,
    sentences: [
      "She absorbed the devastating news with such equanimity that she immediately began shouting.",
      "He received the catastrophic diagnosis with equanimity — asking calm, measured questions and driving himself home.",
      "The equanimity of the stadium crowd — surging, chanting, furious — was remarkable to witness.",
      "His equanimity in negotiations was feared: opponents never knew when his emotional outbursts would arrive."
    ],
    explanation: "Equanimity means mental calmness under pressure. Option A (immediately shouting), Option C (furious surging crowd), and Option D (emotional outbursts) all contradict calmness."
  },
  "inveterate": {
    correct: 0,
    sentences: [
      "An inveterate traveller, she had not spent more than three consecutive months in the same city in forty years.",
      "She made an inveterate decision to change everything about her life — fresh start, new city, new career.",
      "The inveterate newcomer arrived at the industry with no prior experience and no fixed habits.",
      "His inveterate open-mindedness meant his position shifted with every new piece of information."
    ],
    explanation: "Inveterate means having a deeply ingrained, long-established habit unlikely to change. Options B (sudden decision to change everything), C (newcomer with no habits), and D (shifts constantly) all contradict this."
  },
  "circumlocution": {
    correct: 3,
    sentences: [
      "She answered with admirable circumlocution: one word, delivered with full eye contact — 'Yes.'",
      "His circumlocution was so direct that everyone immediately grasped exactly what he meant.",
      "The circumlocution in her argument cut straight to the heart of the matter in under a sentence.",
      "The politician's circumlocution on the budget took eight minutes to communicate a single, simple fact."
    ],
    explanation: "Circumlocution means using many words where fewer would do. Options A (one word), B (direct, immediately grasped), and C (cuts straight to it in a sentence) all describe the opposite."
  },
  "recherché": {
    correct: 2,
    sentences: [
      "Her recherché taste in music ran to whatever was currently sitting atop the charts.",
      "He was deliberately recherché in his drinking habits, sticking exclusively to the nation's best-selling lager.",
      "The menu was almost comically recherché — dishes built from fermented flowers and reduction of foraged bark.",
      "She dressed in a recherché style that could be picked up from any high street shop."
    ],
    explanation: "Recherché means rare, obscure, exquisitely unusual. Options A (top of the charts), B (best-selling lager), and D (any high street shop) all describe widely accessible, popular things."
  },
  "fulgent": {
    correct: 1,
    sentences: [
      "The fulgent cave interior was difficult to navigate — dark and dripping with no light source.",
      "The fulgent afternoon sun turned the wet rooftops to copper and gold.",
      "A fulgent shade of grey settled over the sky as the storm rolled in from the west.",
      "His fulgent mood at the memorial brought a sense of sombre gravity to the room."
    ],
    explanation: "Fulgent means shining brilliantly. Option A (dark cave), Option C (grey storm), and Option D (sombre gravity) are all the opposite of brilliance or radiance."
  },
  "apothegm": {
    correct: 0,
    sentences: [
      "'Move fast and break things' became the defining apothegm of an entire generation of founders.",
      "His ten-thousand-word apothegm explored the full complexity of the issue from every angle.",
      "The novelist's apothegm filled three volumes with intricate, layered storytelling.",
      "She delivered a powerful apothegm that kept the audience engaged for two hours."
    ],
    explanation: "An apothegm is a short, witty, instructive saying. Options B (ten thousand words), C (three volumes), and D (two hours) all describe something lengthy — the opposite of pithy."
  },
  "nugatory": {
    correct: 2,
    sentences: [
      "The nugatory discovery transformed the course of medical science for a generation.",
      "Her nugatory contribution — redesigning the entire database from scratch — saved the company.",
      "His objection proved nugatory — the committee overrode it without discussion.",
      "The nugatory keynote drew thousands and sparked a debate that lasted months."
    ],
    explanation: "Nugatory means of no value or importance. Options A (transformed medicine), B (saved the company), and D (drew thousands, sparked debate) all describe the opposite of futility."
  },
  "serendipity": {
    correct: 3,
    sentences: [
      "By sheer serendipity, everything unfolded exactly as they had planned.",
      "The scientist's discovery was the product of deliberate, methodical serendipity.",
      "The serendipity of the outcome was predictable from the very first meeting.",
      "By pure serendipity, she found herself seated next to the exact investor she'd been trying to reach."
    ],
    explanation: "Serendipity means a happy accident, a fortunate unplanned event. Option A (went as planned), Option B (deliberate and methodical), and Option C (predictable) all contradict the idea of chance."
  },
  "meretricious": {
    correct: 0,
    sentences: [
      "The campaign was meretricious — beautiful imagery and stirring music concealing a total absence of policy.",
      "Critics praised the meretricious novel for its intellectual rigour and profound depth.",
      "Her meretricious argument was celebrated for its logical precision and honesty.",
      "He immediately saw through the meretricious offer and recognised its genuine underlying value."
    ],
    explanation: "Meretricious means attractive on the surface but hollow underneath. Options B (intellectual rigour), C (logical precision and honesty), and D (genuine underlying value) all attribute real substance to something meretricious never has."
  },
  "internecine": {
    correct: 1,
    sentences: [
      "The internecine treaty brought the two sides together in lasting peace.",
      "The internecine feud between factions left the party too fractured to fight the election effectively.",
      "Their internecine collaboration produced the most successful product launch in company history.",
      "The internecine partnership lasted fifty years, characterised by trust and shared purpose."
    ],
    explanation: "Internecine means mutually destructive conflict, especially within a group. Options A (lasting peace), C (successful collaboration), and D (trust and shared purpose) all describe outcomes internal conflict never produces."
  },
  "vitiate": {
    correct: 2,
    sentences: [
      "The new evidence vitiated the case against him, making conviction a near certainty.",
      "Her additions vitiated the proposal entirely, transforming it into something genuinely workable.",
      "One falsified signature was enough to vitiate the entire contract.",
      "His mentor's feedback vitiated his talent, helping it flourish beyond all expectations."
    ],
    explanation: "Vitiate means to impair, corrupt, or render invalid. Options A (making conviction certain), B (transforming into something workable), and D (helping talent flourish) all describe strengthening or improving — the opposite."
  },
  "crepuscular": {
    correct: 3,
    sentences: [
      "The beach was at its most crepuscular at noon — blazing, brilliant, the sun directly overhead.",
      "Bats are crepuscular hunters, most active in the dead hours of the deep night.",
      "The restaurant's crepuscular interior was brightly lit to accommodate the lunchtime rush.",
      "Foxes are crepuscular — most active at the edges of the day, when light shifts from dark to dawn."
    ],
    explanation: "Crepuscular means relating to or active during twilight. Option A (noon sun), Option B (dead of night — that's nocturnal), and Option C (brightly lit lunchtime) all contradict the twilight meaning."
  },
  "salubrious": {
    correct: 0,
    sentences: [
      "The doctor prescribed a salubrious routine — daily walks, fresh air, and early nights.",
      "The salubrious fumes from the factory had prompted a public health investigation.",
      "Moving into the salubrious slums seemed to worsen his health by the week.",
      "The salubrious conditions in the mine — damp, airless, lit by lantern — concerned inspectors."
    ],
    explanation: "Salubrious means health-giving or pleasantly wholesome. Options B (factory fumes), C (slums worsening health), and D (damp, airless mine) all describe conditions inimical to health."
  },
  "excoriate": {
    correct: 1,
    sentences: [
      "The judge excoriated the defence team, praising their preparation and courtroom conduct.",
      "The review excoriated the film, calling it 'a cynical, hollow exercise in audience contempt.'",
      "She excoriated her assistant's brilliant work by giving him a glowing recommendation.",
      "He was excoriated at the ceremony, receiving the industry's highest award to a standing ovation."
    ],
    explanation: "Excoriate means to criticise severely or censure harshly. Options A (praising), C (glowing recommendation), and D (highest award, standing ovation) all describe the opposite."
  },
  "umbrage": {
    correct: 0,
    sentences: [
      "She took umbrage at being passed over for the promotion without a word of explanation.",
      "He offered umbrage as a peace gesture, hoping it would smooth things over.",
      "The umbrage between old colleagues was evident in their easy laughter and shared jokes.",
      "She took umbrage at the praise, immediately asking if there was anything else she could do."
    ],
    explanation: "Umbrage means taking offence or feeling slighted. Option B (you offer something, not umbrage). Option C (laughter and jokes = warmth, not offence). Option D (taking umbrage at praise makes no sense in this framing)."
  },
  "penurious": {
    correct: 2,
    sentences: [
      "The penurious philanthropist donated millions to hospitals every financial year.",
      "His penurious lifestyle was evident in the lavish parties and rare wines he became known for.",
      "So penurious he reused teabags twice, he nonetheless died leaving a small fortune.",
      "The penurious firm handed out record bonuses across the board without hesitation."
    ],
    explanation: "Penurious means extremely poor or miserly. Options A (millions to charity), B (lavish parties, rare wines), and D (record bonuses without hesitation) all contradict poverty or miserliness."
  },
  "grandiloquent": {
    correct: 3,
    sentences: [
      "His grandiloquent instructions were so clear that the team completed the task without a single question.",
      "She was admired for her grandiloquent style — spare, sharp, and stripped of all excess.",
      "The grandiloquent manual was written so plainly that any newcomer could follow it at once.",
      "His toast referenced three philosophers, a Homeric metaphor, and his own 'inexorable destiny.'"
    ],
    explanation: "Grandiloquent means using pompous or extravagant language. Options A (no questions needed), B (spare and stripped of excess), and C (written plainly for newcomers) all describe the opposite of pomposity."
  },
  "fecund": {
    correct: 1,
    sentences: [
      "The fecund desert produced almost no life — just dust and the occasional bleached bone.",
      "The fecund screenwriter had four scripts in development simultaneously and two more outlined.",
      "His fecund writer's block kept him from completing a single project for over a decade.",
      "The fecund soil yielded nothing but disappointment after years of mismanagement."
    ],
    explanation: "Fecund means highly productive or fertile. Options A (almost no life), C (blocked, no projects complete), and D (yields nothing) all describe the opposite of fertility or productivity."
  },
  "recusant": {
    correct: 0,
    sentences: [
      "A quiet recusant, she refused to sign any policy she found ethically indefensible.",
      "The recusant soldier executed every order without hesitation and without complaint.",
      "She was known as the most recusant member of the group — always the first to agree.",
      "His recusant enthusiasm made him the team's most willing volunteer."
    ],
    explanation: "Recusant means someone who refuses to submit to authority or comply. Options B (executes orders without hesitation), C (always first to agree), and D (most willing volunteer) all describe the opposite."
  },
  "vituperate": {
    correct: 2,
    sentences: [
      "He vituperated the opposing team with a gracious post-match handshake and a warm smile.",
      "She vituperated her colleague's idea, calling it the most original thinking she'd encountered all year.",
      "He vituperated the referee so loudly that security removed him from the ground entirely.",
      "The critic vituperated the novel with a five-star review calling it 'a modern masterpiece.'"
    ],
    explanation: "Vituperate means to berate or insult in strong, violent language. Options A (gracious handshake), B (called it most original), and D (five-star masterpiece) all describe praise or warmth."
  },
  "luculent": {
    correct: 3,
    sentences: [
      "His luculent explanation left the audience more confused than when he'd started.",
      "The luculent darkness of the cave made it nearly impossible to see two feet ahead.",
      "A luculent thinker, he was known for arguments that no one in the room could follow.",
      "Her luculent account of the evening's events left no detail ambiguous or unresolved."
    ],
    explanation: "Luculent means clearly expressed or luminous. Options A (more confused), B (darkness, impossible to see), and C (no one could follow) all describe the opposite of clarity."
  },
  "scintilla": {
    correct: 1,
    sentences: [
      "There was a scintilla of evidence — thousands of documents, hours of recorded testimony.",
      "Without a scintilla of remorse, he signed the order and walked out.",
      "The scintilla of rainfall they received that month — nearly four inches — flooded three streets.",
      "The scintilla of the performance stretched to five hours and reduced the audience to tears."
    ],
    explanation: "A scintilla is a tiny trace or spark — the smallest amount. Options A (thousands of documents), C (four inches of rain), and D (five-hour performance) all describe substantial quantities."
  },
  "minatory": {
    correct: 2,
    sentences: [
      "The minatory letter was warm and encouraging, wishing her every success in her new role.",
      "His minatory smile put every guest immediately at ease.",
      "The general's minatory silence before the briefing had every officer sitting perfectly straight.",
      "She adopted a minatory tone, gently suggesting they might want to consider an alternative."
    ],
    explanation: "Minatory means conveying a threat. Options A (warm, encouraging), B (put guests at ease), and D (gently suggesting an alternative) all describe unthreatening behaviour."
  },
  "oleaginous": {
    correct: 3,
    sentences: [
      "His oleaginous manner immediately revealed his honesty and personal integrity.",
      "She was oleaginous in her feedback — blunt to the point of cruelty, never once softening the blow.",
      "The oleaginous spring water was celebrated across the region for its exceptional purity.",
      "His oleaginous charm — all smiles and flattery — made everyone slightly uneasy."
    ],
    explanation: "Oleaginous means unpleasantly smooth and ingratiating, oily in manner. Option A (honest and integrity) and Option B (blunt and cruel) both describe the opposite. Option C applies the literal 'oily' sense to water in a way that reads as a compliment, not the figurative intended meaning."
  },
  "sesquipedalian": {
    correct: 1,
    sentences: [
      "Her sesquipedalian speech was so plain that a ten-year-old in the front row nodded along.",
      "His sesquipedalian lectures regularly sent students reaching for a dictionary mid-sentence.",
      "He wrote with sesquipedalian brevity — never more than five letters in any single word.",
      "Her sesquipedalian style was praised for cutting complexity down to a single, perfect word."
    ],
    explanation: "Sesquipedalian describes the use of very long words. Options A (plain, a ten-year-old follows), C (five-letter words, brevity), and D (cutting to a single word) all describe the opposite of long-winded vocabulary."
  },
  "pernicious": {
    correct: 2,
    sentences: [
      "The pernicious new legislation was immediately praised for its transparency and public benefit.",
      "His pernicious health regime transformed him within months — peak fitness, glowing reviews.",
      "The pernicious myth that talent is innate quietly discourages people from ever trying.",
      "Her pernicious advice guided the team to their most successful quarter on record."
    ],
    explanation: "Pernicious means subtly harmful, especially in a gradual, insidious way. Options A (public benefit), B (peak fitness, glowing reviews), and D (most successful quarter) all describe positive outcomes."
  },
  "turpitude": {
    correct: 3,
    sentences: [
      "The award recognised a lifetime of turpitude — charitable work, community service, and personal sacrifice.",
      "Her moral turpitude was evident in every principled, honest decision she had ever made.",
      "Turpitude, in his case, meant forty years of unbroken dedication to public service.",
      "The charges of moral turpitude were enough to end his political career within a week."
    ],
    explanation: "Turpitude means wickedness and moral depravity. Options A, B, and C all describe admirable moral conduct — the precise opposite."
  },
  "sylvan": {
    correct: 0,
    sentences: [
      "The cottage sat in a sylvan clearing, surrounded on all sides by ancient oaks.",
      "They escaped for a sylvan weekend in a suite on the forty-fourth floor of a downtown hotel.",
      "The sylvan skyline was defined by glass towers, cranes, and the distant glare of motorway lights.",
      "The sylvan atmosphere of the trading floor was tense and loud with the noise of the open bell."
    ],
    explanation: "Sylvan means consisting of or associated with pleasant woodland. Options B (forty-fourth floor of a downtown hotel), C (glass towers and motorways), and D (trading floor) all describe urban environments."
  },
  "halcyon": {
    correct: 2,
    sentences: [
      "These halcyon days ahead promise to be the most turbulent of the coming decade.",
      "She looked back on the financial crisis years as a halcyon time — easy, carefree, abundant.",
      "He spoke fondly of the halcyon summers of his childhood, when the world felt unhurried.",
      "The halcyon boardroom was thick with unresolved grievance and barely concealed tension."
    ],
    explanation: "Halcyon means idyllically happy and peaceful, usually referring to the past. Option A (turbulent days ahead), Option B (financial crisis), and Option D (thick with tension) all contradict peace and happiness."
  },
  "concatenate": {
    correct: 3,
    sentences: [
      "She concatenated the project by breaking it into entirely separate, unrelated workstreams.",
      "The team concatenated their efforts by working in complete isolation from one another.",
      "He concatenated his thinking by resisting any connection between individual ideas.",
      "A series of small delays concatenated into a backlog that took three days to clear."
    ],
    explanation: "Concatenate means to link things together in a chain. Options A, B, and C all describe separation or disconnection — the opposite of chaining together."
  },
  "complaisant": {
    correct: 1,
    sentences: [
      "Her complaisant refusal to accommodate the guests left the evening in disarray.",
      "The complaisant host quietly rearranged the seating plan the moment a guest mentioned a preference.",
      "The complaisant critic was known across the industry for his savage, unsparing reviews.",
      "His complaisant insistence on doing things exclusively his own way frustrated the whole team."
    ],
    explanation: "Complaisant means cheerfully willing to please and accommodate. Options A (refusal to accommodate), C (savage reviews), and D (insisting on own way) all contradict this."
  },
  "probity": {
    correct: 0,
    sentences: [
      "His probity was unquestioned — thirty years in public life and never a breath of scandal.",
      "Her probity at the negotiating table meant she consistently withheld key information from counterparts.",
      "The politician's probity became apparent the moment the corruption charges were filed.",
      "Known for her probity, she was the first to shade the truth whenever it suited the outcome."
    ],
    explanation: "Probity means strong moral integrity and complete honesty. Options B (withholding information), C (corruption charges), and D (shading the truth) all describe the opposite."
  },
  "piquant": {
    correct: 2,
    sentences: [
      "The dish was piquant in the purest sense — entirely flavourless, leaving no impression at all.",
      "There was a piquant blandness to the stew that made it immediately forgettable.",
      "There was something piquant about learning the fraud investigator was himself under investigation.",
      "The piquant aftertaste faded so quickly it was as though nothing had passed her lips."
    ],
    explanation: "Piquant means pleasantly sharp, stimulating to the mind or palate. Options A (flavourless), B (bland and forgettable), and D (fades immediately) all describe the absence of stimulation."
  },
  "cogent": {
    correct: 1,
    sentences: [
      "His cogent argument left the room more confused than it had been at the start.",
      "She made a cogent case: three clear points, solid evidence, no filler, no hedging.",
      "The cogent evidence — a single unverified rumour — was enough to sway the committee.",
      "A cogent speaker, he was famous for losing the thread mid-sentence and never quite recovering."
    ],
    explanation: "Cogent means clear, logical, and compelling. Options A (leaves people confused), C (a single unverified rumour), and D (loses the thread mid-sentence) all describe the opposite."
  },
  "luminary": {
    correct: 0,
    sentences: [
      "The hall filled to capacity whenever this particular luminary agreed to give a talk.",
      "As a luminary, her most lasting achievement was being consistently overlooked by the field.",
      "She was considered a luminary for producing work that reliably fell below the industry standard.",
      "The luminary of the department had only joined six months ago and was still learning the basics."
    ],
    explanation: "A luminary is an eminent, inspiring person who lights the way for others. Options B (consistently overlooked), C (below industry standard), and D (only joined six months ago) all contradict eminence."
  },
  "calumniate": {
    correct: 3,
    sentences: [
      "She calumniated her colleague with a detailed account of his genuine strengths.",
      "He calumniated the report by highlighting its rigour and factual accuracy.",
      "She calumniated the team's reputation by cataloguing their many verified achievements.",
      "His opponents calumniated him with fabricated stories planted in the press."
    ],
    explanation: "Calumniate means to make false defamatory statements about someone. Options A, B, and C all describe accurate, positive accounts — the opposite of defamation."
  },
  "effulgent": {
    correct: 2,
    sentences: [
      "The effulgent midnight sky was moonless and covered entirely in cloud.",
      "His effulgent mood at the funeral cast a quiet, sombre pall over the service.",
      "She entered the room looking effulgent — tanned, bright-eyed, dressed impeccably.",
      "The effulgent cave interior offered the explorers nothing but cold and darkness."
    ],
    explanation: "Effulgent means radiant, shining brilliantly. Options A (moonless, clouded), B (sombre funeral mood), and D (cold and darkness) all describe the opposite."
  },
  "numinous": {
    correct: 1,
    sentences: [
      "There was something numinous about the spreadsheet — columns of figures, neatly aligned.",
      "Standing alone in the ancient stone circle, she felt something numinous — vast, quiet, beyond words.",
      "The numinous quarterly results exceeded projections and impressed the board.",
      "He found the experience entirely numinous — mundane, slightly tedious, easily forgotten."
    ],
    explanation: "Numinous means evoking a sense of the divine or spiritually transcendent. Options A (a spreadsheet), C (quarterly financial results), and D (mundane and tedious) all describe thoroughly un-transcendent experiences."
  },
  "jejune": {
    correct: 3,
    sentences: [
      "Her jejune analysis of the crisis was immediately cited by experts for its remarkable depth.",
      "The professor was impressed by the student's jejune thesis — a model of sophisticated argumentation.",
      "Critics praised the film's jejune complexity, calling it the most intellectually demanding work in years.",
      "The op-ed read as jejune — as if the author had spent one afternoon on a topic deserving years."
    ],
    explanation: "Jejune means naive, simplistic, or lacking substance. Options A (remarkable depth), B (sophisticated argumentation), and C (most intellectually demanding) all attribute substance that jejune specifically lacks."
  },
  "impecunious": {
    correct: 0,
    sentences: [
      "Too impecunious to cover his rent, he slept on a friend's sofa for the better part of a year.",
      "The impecunious firm distributed record bonuses to every member of staff.",
      "Her impecunious lifestyle was funded by a trust fund she barely ever thought to touch.",
      "The impecunious billionaire spent the summer deciding which of his properties to sell."
    ],
    explanation: "Impecunious means chronically short of money. Options B (record bonuses), C (trust fund, never touched), and D (a billionaire with multiple properties) all describe wealth or financial comfort."
  },
  "querulous": {
    correct: 2,
    sentences: [
      "His querulous acceptance of every situation made him a pleasure to work alongside.",
      "She was so querulous that colleagues sought her out whenever they needed a dispute resolved.",
      "Her querulous messages arrived daily — each finding fault with some new, minor detail.",
      "Known for being querulous, he had never once raised a complaint in his career."
    ],
    explanation: "Querulous means petulantly or persistently complaining. Options A (accepts everything), B (sought out to resolve disputes), and D (never raised a complaint) all describe the opposite."
  },
  "sophistry": {
    correct: 0,
    sentences: [
      "The lawyer's sophistry sounded airtight in the courtroom but collapsed under the first serious question.",
      "The argument was entirely free of sophistry — every step logically sound and empirically verified.",
      "She admired his sophistry for its unfailing transparency and commitment to honest reasoning.",
      "His sophistry was so rigorous that opposing counsel could not find a single logical gap."
    ],
    explanation: "Sophistry means using clever but false or misleading arguments. Options B (logically sound, empirically verified), C (transparent, honest reasoning), and D (no logical gap found) all attribute genuine rigor to what sophistry never has."
  },
  "anodyne": {
    correct: 3,
    sentences: [
      "The anodyne press release sparked immediate controversy and dominated the news for a week.",
      "She was known for her anodyne opinions — always provocative, never afraid to cause offence.",
      "His anodyne approach to the negotiation set off a chain of angry responses from both sides.",
      "The spokesperson's anodyne statement acknowledged the incident without saying anything at all."
    ],
    explanation: "Anodyne means bland and inoffensive, unlikely to cause disagreement. Options A (immediate controversy), B (provocative, causes offence), and C (angry responses from both sides) all describe the opposite."
  },
  "hubris": {
    correct: 1,
    sentences: [
      "His hubris in the face of failure was admirable — humble, self-critical, and genuinely contrite.",
      "His hubris in assuming he could never lose cost him the championship in the final round.",
      "It took real hubris for her to acknowledge her limitations and ask for help.",
      "She showed hubris in every meeting by deferring to colleagues with more experience than her."
    ],
    explanation: "Hubris means excessive, often fatal pride or overconfidence. Options A (humble, contrite), C (acknowledging limitations and asking for help), and D (deferring to more experienced colleagues) all describe humility — the opposite."
  },
  "apotheosis": {
    correct: 2,
    sentences: [
      "The film's apotheosis was its opening scene — muddled and confusing, according to most critics.",
      "Finishing last in his fifth marathon was, by any measure, the apotheosis of his athletic career.",
      "The final concert was the apotheosis of her career: a sold-out Carnegie Hall, a standing ovation.",
      "His apotheosis came before he had achieved a single notable thing — at the very start of his career."
    ],
    explanation: "Apotheosis means the highest or most perfect example; the pinnacle. Options A (muddled opening scene), B (finishing last), and D (before achieving anything) all describe low points, not peaks."
  },
  "abstemious": {
    correct: 0,
    sentences: [
      "Living alone, he was abstemious — a light supper, a single glass of water, bed by nine.",
      "His abstemious habits were legendary: three desserts at every meal, wine with breakfast.",
      "She was abstemious to a fault, always the first to order another round at the bar.",
      "The abstemious banquet ran to seven courses and concluded with brandy and cigars."
    ],
    explanation: "Abstemious means not self-indulgent, moderate in eating and drinking. Options B (three desserts, wine with breakfast), C (always ordering another round), and D (seven courses, brandy and cigars) all describe the opposite."
  },
  "pugnacious": {
    correct: 3,
    sentences: [
      "Her pugnacious diplomacy brought the two sides to the table and produced a lasting settlement.",
      "The pugnacious mediator was known across the industry for defusing tension with calm precision.",
      "Known as pugnacious, she was the first person colleagues rang when they needed comfort or advice.",
      "His pugnacious response to even the mildest feedback made performance reviews a dreaded event."
    ],
    explanation: "Pugnacious means eager or quick to argue or fight. Options A (lasting settlement), B (defusing tension), and C (people seek out for comfort) all describe peaceable qualities."
  },
  "dilettante": {
    correct: 2,
    sentences: [
      "The dilettante surgeon had spent twenty years perfecting a single, highly specialised technique.",
      "As a dilettante, her depth of knowledge in the subject was widely considered unmatched.",
      "He was a dilettante — enthusiastic about painting, cooking, and music, master of none.",
      "The dilettante's lifelong dedication to a single craft earned her international renown."
    ],
    explanation: "A dilettante dabbles across interests without real depth or commitment. Options A (twenty years, highly specialised), B (depth unmatched), and D (lifelong dedication to one craft) all describe expertise and commitment."
  },
  "redolent": {
    correct: 1,
    sentences: [
      "The sterile, odourless room was redolent of pine and fresh morning rain.",
      "The phrase was redolent of a bygone era — stiff and formal, like something from a Victorian letter.",
      "His writing was redolent of total originality, bearing no resemblance to any prior influence.",
      "The entirely stripped, minimalist office was redolent of warmth, personality, and decades of memory."
    ],
    explanation: "Redolent means strongly evocative of or reminiscent of something; or having a scent. Options A (odourless room), C (total originality — redolent of others is the opposite), and D (minimalist, stripped of personality) all contradict evocation."
  },
  "cavil": {
    correct: 0,
    sentences: [
      "He cavilled endlessly over the font choice while the rest of the room debated the core strategy.",
      "Her cavil uncovered the central structural flaw that rendered the entire proposal unworkable.",
      "He cavilled by immediately agreeing to every term without asking a single question.",
      "Their cavil exposed a fundamental truth: the premise of the whole project was wrong."
    ],
    explanation: "To cavil means to raise trivial or petty objections. Options B and D describe finding something fundamental — the opposite of trivial. Option C (immediately agreeing) contradicts objecting entirely."
  },
  "parlous": {
    correct: 3,
    sentences: [
      "The parlous state of his finances was evident in the penthouse he'd just purchased.",
      "She navigated the parlous terrain with ease, never once feeling at risk.",
      "His parlous grip on the project inspired quiet confidence in everyone he briefed.",
      "The company was in a parlous state — weeks from insolvency, with no credible plan in sight."
    ],
    explanation: "Parlous means precarious and full of danger or uncertainty. Options A (just bought a penthouse), B (never at risk), and C (inspired confidence) all describe ease or security."
  },
  "phlegmatic": {
    correct: 2,
    sentences: [
      "His phlegmatic reaction to winning the lottery was to scream, call everyone he knew, and book a holiday.",
      "She was phlegmatic throughout the meeting, raising her voice repeatedly as the tension mounted.",
      "His phlegmatic response to the diagnosis — two calm questions and a quiet drive home — unsettled everyone who'd expected panic.",
      "The phlegmatic crowd surged toward the exits, chanting and pushing against the barriers."
    ],
    explanation: "Phlegmatic means having an unemotional, stolidly calm disposition. Options A (screaming, calling everyone), B (raising her voice), and D (surging, chanting crowd) all describe the opposite of calm."
  },
  "concomitant": {
    correct: 1,
    sentences: [
      "The concomitant effect was entirely unrelated — arising from a completely separate set of causes.",
      "Rapid growth brought concomitant pressures: staff shortages, quality dips, and widespread burnout.",
      "Price increases and their concomitant refunds kept every customer perfectly satisfied.",
      "She achieved success without any concomitant difficulty — everything went smoothly from the start."
    ],
    explanation: "Concomitant means naturally accompanying or associated with something. Options A (unrelated, separate causes), C (refunds logically cancel out price increases, making them not truly concomitant), and D (without any accompanying difficulty) all contradict the idea of natural accompaniment."
  },
  "sedulous": {
    correct: 0,
    sentences: [
      "Her sedulous revision — six full drafts across three months — produced a genuinely polished final essay.",
      "His sedulous approach to the project meant working one unfocused hour per month.",
      "She was sedulous in avoiding effort, having perfected the appearance of work without the substance.",
      "The sedulous intern finished tasks only when reminded and rarely without at least one significant error."
    ],
    explanation: "Sedulous means showing dedicated, persistent diligence. Options B (one hour a month, unfocused), C (avoiding effort), and D (needing reminders, making errors) all describe the opposite."
  },
  "inimical": {
    correct: 2,
    sentences: [
      "The inimical support from her mentor accelerated her career beyond all previous expectations.",
      "Short-term thinking is inimical to long-term strategy — it makes you plan with more rigour.",
      "His micromanagement style was inimical to creativity, steadily extinguishing it across the team.",
      "The funding proved inimical to the project, providing exactly what was needed to move forward."
    ],
    explanation: "Inimical means hostile or tending to harm. Options A (accelerated her career), B (makes you plan more rigorously — a benefit), and D (providing what was needed) all describe something helpful."
  },
  "tenebrous": {
    correct: 3,
    sentences: [
      "The tenebrous café was so brightly lit that patrons were issued sunglasses at the door.",
      "Her tenebrous complexion glowed with such health it caught the light across the room.",
      "He found the tenebrous summer afternoon joyful and infectious — all light and laughter.",
      "The tenebrous corridor stretched ahead without a single working light to guide them."
    ],
    explanation: "Tenebrous means dark, shadowy, or obscure. Options A (brightly lit), B (glowing with health), and C (light and laughter) all describe brightness or warmth."
  },
  "perfidious": {
    correct: 1,
    sentences: [
      "Her perfidious loyalty was total — she would have taken the secret to her grave.",
      "The perfidious general switched sides the night before the decisive engagement.",
      "Known as perfidious, he was the one person everyone trusted with their closest secrets.",
      "His perfidious honesty made him the most reliable voice in any difficult negotiation."
    ],
    explanation: "Perfidious means deceitful and guilty of betrayal. Options A (loyalty, taking secrets to the grave), C (trusted with secrets), and D (honesty, reliability) all describe trustworthiness — the exact opposite."
  }
};
