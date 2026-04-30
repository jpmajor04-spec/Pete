// Pete — Wordsmith mascot
// A plump, bespectacled man in a colourful rugby shirt and sandals,
// named after a man at church who is exemplary with complex vocabulary.

let _peteId = 0;

const SHIRT_PRESETS = {
  default:  ['#c82200', '#1a7a3a', '#e8be10', '#1a3aaa'],
  ocean:    ['#1a3a8a', '#1a7a9a', '#e8f4f8', '#d4a820'],
  sunset:   ['#e05010', '#c83050', '#9030a0', '#604080'],
  forest:   ['#1a5020', '#5a3010', '#e8dcc0', '#8a7040'],
  midnight: ['#0a0a2a', '#2a2a6a', '#8080b0', '#1a1a4a'],
  gold:     ['#c8a010', '#8a6010', '#f0e8d0', '#4a3010'],
  hawaiian: ['#e05818', '#e8c010', '#c81870', '#208050'],
  tuxedo:   ['#111111', '#1a1a1a', '#ffffff', '#111111'],
  preppy:   ['#8a1010', '#f0e8e0', '#1a2a8a', '#2a6a1a'],
};

function createPeteSVG(heightPx = 80, opts = {}) {
  const id = ++_peteId;
  const w = Math.round(heightPx * 0.78);
  const h = heightPx;
  const { flip = false, bubble = null, wardrobe = {} } = opts;
  const transform = flip ? `transform="scale(-1,1) translate(-60,0)"` : '';

  const [s0, s1, s2, s3] = SHIRT_PRESETS[wardrobe.shirt || 'default'] || SHIRT_PRESETS.default;

  // Hat SVG (rendered on top of head/hair)
  let hatSvg = '';
  if (wardrobe.hat === 'flatcap') {
    hatSvg = `
  <!-- Flat cap -->
  <ellipse cx="30" cy="5" rx="16" ry="7" fill="#6b3e18"/>
  <rect x="14" y="3" width="24" height="5" rx="2" fill="#5a3010"/>
  <ellipse cx="39" cy="9" rx="9" ry="2.5" fill="#5a3010"/>`;
  } else if (wardrobe.hat === 'beanie') {
    hatSvg = `
  <!-- Beanie -->
  <rect x="13" y="0" width="34" height="13" rx="10" fill="${s0}"/>
  <rect x="13" y="8" width="34" height="5" fill="${s1}"/>
  <circle cx="30" cy="-2.5" r="4.5" fill="${s2}"/>`;
  } else if (wardrobe.hat === 'cowboy') {
    hatSvg = `
  <!-- Cowboy hat -->
  <ellipse cx="30" cy="11" rx="23" ry="4.5" fill="#8b5a30"/>
  <path d="M16 11 Q17 2 30 1 Q43 2 44 11 Z" fill="#6b3e18"/>
  <ellipse cx="30" cy="11" rx="23" ry="4.5" fill="none" stroke="#5a3010" stroke-width="0.8"/>
  <path d="M17 9.5 Q30 7.5 43 9.5" stroke="#c8a010" stroke-width="1.8" fill="none"/>`;
  } else if (wardrobe.hat === 'tophat') {
    hatSvg = `
  <!-- Top hat -->
  <rect x="18" y="-3" width="24" height="16" rx="2" fill="#111111"/>
  <rect x="12" y="12" width="36" height="4.5" rx="2" fill="#111111"/>
  <rect x="18" y="10.5" width="24" height="2.5" fill="#c8a010"/>`;
  } else if (wardrobe.hat === 'gradcap') {
    hatSvg = `
  <!-- Graduation cap -->
  <path d="M13 7 L30 0 L47 7 Z" fill="#1a1a4a"/>
  <rect x="17" y="6" width="26" height="6" rx="1" fill="#1a1a4a"/>
  <rect x="15" y="6" width="30" height="3.5" rx="1" fill="#1a1a4a"/>
  <line x1="44" y1="6" x2="47" y2="17" stroke="#c8a010" stroke-width="1.8"/>
  <circle cx="47" cy="19" r="2.5" fill="#c8a010"/>`;
  } else if (wardrobe.hat === 'crown') {
    hatSvg = `
  <!-- Crown -->
  <path d="M14 10 L18 2 L23 8 L30 -2 L37 8 L42 2 L46 10 Z" fill="#c8a010" stroke="#8a6808" stroke-width="1.2"/>
  <rect x="14" y="10" width="32" height="5.5" rx="2" fill="#c8a010" stroke="#8a6808" stroke-width="1.2"/>
  <ellipse cx="30" cy="10" rx="16" ry="1.8" fill="#a07808"/>
  <circle cx="30" cy="3" r="2.8" fill="#c83020"/>
  <circle cx="19.5" cy="7" r="2" fill="#3060c8"/>
  <circle cx="40.5" cy="7" r="2" fill="#20a840"/>
  <circle cx="14.5" cy="10.5" r="1.5" fill="#e8c010"/>
  <circle cx="45.5" cy="10.5" r="1.5" fill="#e8c010"/>`;
  } else if (wardrobe.hat === 'pirate') {
    hatSvg = `
  <!-- Pirate tricorn -->
  <path d="M10 14 Q16 6 22 10 Q30 5 38 10 Q44 6 50 14 Z" fill="#181818"/>
  <path d="M10 14 L12 17 Q22 13 30 16 Q38 13 48 17 L50 14" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
  <circle cx="30" cy="10" r="3.5" fill="#e8e8e0"/>
  <circle cx="28.4" cy="8.8" r="1" fill="#181818"/>
  <circle cx="31.6" cy="8.8" r="1" fill="#181818"/>
  <path d="M28 11 L29 11.6 L30 11.3 L31 11.6 L32 11" stroke="#181818" stroke-width="0.8" fill="none"/>`;
  } else if (wardrobe.hat === 'wizard') {
    hatSvg = `
  <!-- Wizard hat -->
  <path d="M30 -9 L15 12 L45 12 Z" fill="#5a0a9a"/>
  <ellipse cx="30" cy="12" rx="15" ry="3.5" fill="#7820c8"/>
  <path d="M24 -2 L24.6 0.2 L26.8 0.2 L25 1.5 L25.6 3.7 L24 2.5 L22.4 3.7 L23 1.5 L21.2 0.2 L23.4 0.2 Z" fill="#e8c010"/>
  <circle cx="35" cy="3" r="1.8" fill="#e8c010"/>
  <circle cx="21" cy="6" r="1.5" fill="#e8c010"/>`;
  }

  // Pre-body accessory (renders behind Pete's body)
  let preBodySvg = '';
  // Post-body accessory (renders on top)
  let accessorySvg = '';

  if (wardrobe.accessory === 'bowtie') {
    accessorySvg = `
  <!-- Bow tie -->
  <polygon points="24,40 29.5,43.5 24,47" fill="${s0}"/>
  <polygon points="36,40 30.5,43.5 36,47" fill="${s0}"/>
  <circle cx="30" cy="43.5" r="2.2" fill="${s2}"/>`;
  } else if (wardrobe.accessory === 'scarf') {
    accessorySvg = `
  <!-- Scarf -->
  <rect x="20" y="30" width="20" height="8" rx="4" fill="${s0}"/>
  <rect x="26" y="37" width="7" height="12" rx="3.5" fill="${s1}"/>`;
  } else if (wardrobe.accessory === 'cape') {
    preBodySvg = `
  <!-- Cape (behind body) -->
  <path d="M11 36 Q2 55 6 74" stroke="#8020a0" stroke-width="12" fill="none" stroke-linecap="round"/>
  <path d="M49 36 Q58 55 54 74" stroke="#8020a0" stroke-width="12" fill="none" stroke-linecap="round"/>
  <path d="M11 37 Q30 30 49 37" stroke="#5c0078" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  } else if (wardrobe.accessory === 'monocle') {
    accessorySvg = `
  <!-- Monocle on right eye -->
  <circle cx="40" cy="20" r="10" fill="none" stroke="#c8a010" stroke-width="2.2"/>
  <line x1="50" y1="25" x2="53" y2="34" stroke="#c8a010" stroke-width="1.8"/>`;
  } else if (wardrobe.accessory === 'pocketwatch') {
    accessorySvg = `
  <!-- Pocket watch -->
  <path d="M27 39 Q22 46 20 55" stroke="#c8a010" stroke-width="1.5" fill="none"/>
  <circle cx="19" cy="57" r="5.5" fill="#c8a010"/>
  <circle cx="19" cy="57" r="4.5" fill="#f5f0e8"/>
  <line x1="19" y1="57" x2="19" y2="53.5" stroke="#3a2010" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="19" y1="57" x2="21.5" y2="57" stroke="#3a2010" stroke-width="1.2" stroke-linecap="round"/>
  <rect x="17.5" y="51" width="3" height="2.5" rx="1" fill="#c8a010"/>`;
  } else if (wardrobe.accessory === 'newspaper') {
    accessorySvg = `
  <!-- Newspaper in left hand -->
  <rect x="1" y="48" width="13" height="18" rx="1.5" fill="#e8e0c8"/>
  <rect x="1" y="48" width="13" height="4" rx="1" fill="#c8b888"/>
  <line x1="2.5" y1="55" x2="12.5" y2="55" stroke="#a09070" stroke-width="1.2"/>
  <line x1="2.5" y1="58" x2="12.5" y2="58" stroke="#a09070" stroke-width="1.2"/>
  <line x1="2.5" y1="61" x2="12.5" y2="61" stroke="#a09070" stroke-width="1.2"/>
  <line x1="2.5" y1="63.5" x2="9" y2="63.5" stroke="#a09070" stroke-width="1.2"/>`;
  } else if (wardrobe.accessory === 'guitar') {
    accessorySvg = `
  <!-- Electric guitar (right side) -->
  <rect x="50.5" y="18" width="3.5" height="26" rx="1.7" fill="#5a3010"/>
  <rect x="49" y="14" width="7" height="6" rx="2.5" fill="#4a2010"/>
  <ellipse cx="52" cy="49" rx="6.5" ry="6" fill="#c84010"/>
  <ellipse cx="52" cy="57" rx="7.5" ry="7" fill="#c84010"/>
  <circle cx="52" cy="53" r="2.5" fill="rgba(0,0,0,0.4)"/>
  <rect x="48" y="61" width="8.5" height="2.2" rx="1" fill="#4a2010"/>
  <line x1="51" y1="20" x2="51" y2="63" stroke="#e8e8e8" stroke-width="0.5"/>
  <line x1="53" y1="20" x2="53" y2="63" stroke="#e8e8e8" stroke-width="0.5"/>`;
  } else if (wardrobe.accessory === 'cane') {
    accessorySvg = `
  <!-- Walking cane -->
  <line x1="8.5" y1="72" x2="12" y2="37" stroke="#5a3010" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M12 37 Q8 32 6 36" stroke="#5a3010" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <circle cx="8.5" cy="72.5" r="2" fill="#3a2010"/>`;
  } else if (wardrobe.accessory === 'champagne') {
    accessorySvg = `
  <!-- Champagne flute (right hand) -->
  <line x1="54" y1="45" x2="52" y2="57" stroke="#c8a010" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M49.5 40 Q49.5 48 52.5 49 Q56 49 59 40 Z" fill="rgba(220,215,160,0.78)" stroke="#c8a010" stroke-width="1.3"/>
  <ellipse cx="54" cy="40" rx="4.8" ry="1.6" fill="rgba(200,225,80,0.55)"/>
  <circle cx="52" cy="43" r="0.9" fill="rgba(255,255,200,0.95)"/>
  <circle cx="55.5" cy="42" r="0.7" fill="rgba(255,255,200,0.95)"/>
  <circle cx="53.5" cy="46" r="0.6" fill="rgba(255,255,200,0.95)"/>`;
  } else if (wardrobe.accessory === 'diamond') {
    accessorySvg = `
  <!-- Diamond sparkle aura -->
  <line x1="4" y1="15" x2="4" y2="11" stroke="#80d8ff" stroke-width="1.6" stroke-linecap="round"/>
  <line x1="2" y1="13" x2="6" y2="13" stroke="#80d8ff" stroke-width="1.6" stroke-linecap="round"/>
  <line x1="2.8" y1="11.8" x2="5.2" y2="15.2" stroke="#80d8ff" stroke-width="0.9" stroke-linecap="round"/>
  <line x1="5.2" y1="11.8" x2="2.8" y2="15.2" stroke="#80d8ff" stroke-width="0.9" stroke-linecap="round"/>
  <line x1="56" y1="10" x2="56" y2="6" stroke="#80d8ff" stroke-width="1.6" stroke-linecap="round"/>
  <line x1="54" y1="8" x2="58" y2="8" stroke="#80d8ff" stroke-width="1.6" stroke-linecap="round"/>
  <line x1="54.8" y1="6.8" x2="57.2" y2="10.2" stroke="#80d8ff" stroke-width="0.9" stroke-linecap="round"/>
  <line x1="57.2" y1="6.8" x2="54.8" y2="10.2" stroke="#80d8ff" stroke-width="0.9" stroke-linecap="round"/>
  <line x1="2" y1="55" x2="2" y2="51" stroke="#80d8ff" stroke-width="1.4" stroke-linecap="round"/>
  <line x1="0" y1="53" x2="4" y2="53" stroke="#80d8ff" stroke-width="1.4" stroke-linecap="round"/>
  <line x1="57" y1="52" x2="57" y2="49" stroke="#80d8ff" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="55.5" y1="50.5" x2="58.5" y2="50.5" stroke="#80d8ff" stroke-width="1.2" stroke-linecap="round"/>
  <circle cx="9" cy="36" r="1.6" fill="rgba(150,225,255,0.9)"/>
  <circle cx="52" cy="28" r="1.2" fill="rgba(150,225,255,0.9)"/>
  <circle cx="6" cy="62" r="1.1" fill="rgba(150,225,255,0.9)"/>
  <circle cx="57" cy="38" r="1" fill="rgba(150,225,255,0.9)"/>`;
  }

  // Sunglasses replace the normal glasses entirely
  const hasSunglasses = wardrobe.accessory === 'sunglasses';
  const glassesSvg = hasSunglasses ? `
  <!-- Aviator sunglasses (gold frame, warm tinted lenses) -->
  <path d="M10 17 Q10 11 20 11 Q30 11 30 18 Q30 27 20 27 Q10 27 10 17 Z" fill="rgba(90,55,10,0.86)" stroke="#c8a010" stroke-width="1.7"/>
  <path d="M30 17 Q30 11 40 11 Q50 11 50 18 Q50 27 40 27 Q30 27 30 17 Z" fill="rgba(90,55,10,0.86)" stroke="#c8a010" stroke-width="1.7"/>
  <line x1="30" y1="16" x2="30" y2="16" stroke="#c8a010" stroke-width="1.7"/>
  <line x1="10" y1="15" x2="7" y2="13.5" stroke="#c8a010" stroke-width="1.7"/>
  <line x1="50" y1="15" x2="53" y2="13.5" stroke="#c8a010" stroke-width="1.7"/>
  <path d="M13.5 14 Q17 11.5 20.5 13" stroke="rgba(255,220,140,0.45)" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  <path d="M33.5 14 Q37 11.5 40.5 13" stroke="rgba(255,220,140,0.45)" stroke-width="1.3" fill="none" stroke-linecap="round"/>` : `
  <!-- Glasses — thick rectangular frames -->
  <rect x="10" y="14" width="19" height="13" rx="3" fill="rgba(180,215,255,0.22)" stroke="#2a1808" stroke-width="3"/>
  <rect x="31" y="14" width="19" height="13" rx="3" fill="rgba(180,215,255,0.22)" stroke="#2a1808" stroke-width="3"/>
  <line x1="29" y1="19" x2="31" y2="19" stroke="#2a1808" stroke-width="2.5"/>
  <line x1="10" y1="18" x2="8" y2="16" stroke="#2a1808" stroke-width="2.5"/>
  <line x1="50" y1="18" x2="52" y2="16" stroke="#2a1808" stroke-width="2.5"/>`;

  const eyesSvg = hasSunglasses ? '' : `
  <!-- Eyes -->
  <circle cx="20" cy="20" r="3.8" fill="#1e1008"/>
  <circle cx="40" cy="20" r="3.8" fill="#1e1008"/>
  <circle cx="21" cy="18.5" r="1.3" fill="white"/>
  <circle cx="41" cy="18.5" r="1.3" fill="white"/>`;

  const svg = `<svg width="${w}" height="${h}" viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg" class="pete-svg" aria-label="Pete the mascot" style="overflow:visible">
  <!-- Ground shadow -->
  <ellipse cx="30" cy="79" rx="13" ry="2.5" fill="rgba(100,55,15,0.13)"/>

  <!-- Legs (bare skin below shorts) -->
  <rect x="17" y="58" width="8" height="14" rx="4" fill="#e0a870" ${transform}/>
  <rect x="35" y="58" width="8" height="14" rx="4" fill="#e0a870" ${transform}/>

  <!-- Sandals — prominent soles + straps -->
  <!-- Left sole -->
  <ellipse cx="21" cy="75.5" rx="10.5" ry="4" fill="#4a2208"/>
  <ellipse cx="21" cy="74" rx="10" ry="3.2" fill="#8b5a30"/>
  <!-- Left toe-post strap -->
  <rect x="19" y="68.5" width="4" height="5" rx="1.8" fill="#4a2810"/>
  <!-- Left cross strap -->
  <rect x="11.5" y="71" width="19" height="3.2" rx="1.6" fill="#5a3010"/>
  <!-- Left buckle detail -->
  <rect x="13.5" y="71.5" width="3" height="2.2" rx="0.8" fill="#7a4820"/>

  <!-- Right sole -->
  <ellipse cx="39" cy="75.5" rx="10.5" ry="4" fill="#4a2208"/>
  <ellipse cx="39" cy="74" rx="10" ry="3.2" fill="#8b5a30"/>
  <!-- Right toe-post strap -->
  <rect x="37" y="68.5" width="4" height="5" rx="1.8" fill="#4a2810"/>
  <!-- Right cross strap -->
  <rect x="29.5" y="71" width="19" height="3.2" rx="1.6" fill="#5a3010"/>
  <!-- Right buckle detail -->
  <rect x="43.5" y="71.5" width="3" height="2.2" rx="0.8" fill="#7a4820"/>

  ${preBodySvg}
  <!-- Cargo shorts (rendered before body so body overlaps the waistband) -->
  <!-- Left short leg -->
  <rect x="13" y="58" width="15" height="12" rx="4" fill="#c8a850"/>
  <!-- Right short leg -->
  <rect x="32" y="58" width="15" height="12" rx="4" fill="#c8a850"/>
  <!-- Crotch fill -->
  <rect x="27" y="58" width="6" height="12" fill="#c8a850"/>
  <!-- Waistband -->
  <rect x="12" y="57" width="36" height="3" rx="1.5" fill="#9a7828"/>
  <!-- Left cargo pocket -->
  <rect x="14.5" y="62.5" width="6" height="5.5" rx="1.5" fill="#b89040"/>
  <rect x="14.5" y="62.5" width="6" height="1.5" rx="0.8" fill="#9a7828"/>
  <!-- Right cargo pocket -->
  <rect x="39.5" y="62.5" width="6" height="5.5" rx="1.5" fill="#b89040"/>
  <rect x="39.5" y="62.5" width="6" height="1.5" rx="0.8" fill="#9a7828"/>

  <!-- Body — plump ellipse clipped with rugby stripes -->
  <ellipse cx="30" cy="47" rx="22" ry="16" fill="${s0}"/>
  <clipPath id="pb${id}"><ellipse cx="30" cy="47" rx="22" ry="16"/></clipPath>
  <g clip-path="url(#pb${id})">
    <rect x="10" y="36" width="40" height="5.5" fill="${s0}"/>
    <rect x="10" y="41.5" width="40" height="5.5" fill="${s1}"/>
    <rect x="10" y="47" width="40" height="5.5" fill="${s2}"/>
    <rect x="10" y="52.5" width="40" height="5.5" fill="${s3}"/>
    <rect x="10" y="58" width="40" height="5.5" fill="${s0}"/>
    <rect x="10" y="63.5" width="40" height="5.5" fill="${s1}"/>
  </g>

  <!-- Collar V -->
  <path d="M26 38 L30 44 L34 38" stroke="white" stroke-width="1.8" fill="none" stroke-linejoin="round"/>

  <!-- Arms -->
  <ellipse cx="9" cy="47" rx="5.5" ry="10" fill="${s0}"/>
  <clipPath id="la${id}"><ellipse cx="9" cy="47" rx="5.5" ry="10"/></clipPath>
  <g clip-path="url(#la${id})">
    <rect x="3" y="41.5" width="12" height="5.5" fill="${s1}"/>
    <rect x="3" y="52.5" width="12" height="5.5" fill="${s2}"/>
  </g>
  <ellipse cx="51" cy="47" rx="5.5" ry="10" fill="${s1}"/>
  <clipPath id="ra${id}"><ellipse cx="51" cy="47" rx="5.5" ry="10"/></clipPath>
  <g clip-path="url(#ra${id})">
    <rect x="45" y="41.5" width="12" height="5.5" fill="${s0}"/>
    <rect x="45" y="52.5" width="12" height="5.5" fill="${s3}"/>
  </g>

  <!-- Hands -->
  <circle cx="7" cy="58" r="4.5" fill="#e0a870"/>
  <circle cx="53" cy="58" r="4.5" fill="#e0a870"/>

  <!-- Neck -->
  <rect x="24.5" y="32" width="11" height="8" rx="4" fill="#e0a870"/>

  <!-- Head — broader build (wider than tall) -->
  <ellipse cx="30" cy="20" rx="21" ry="18" fill="#e0a870"/>

  <!-- Ears -->
  <ellipse cx="9.5" cy="20" rx="4.5" ry="5.5" fill="#e0a870"/>
  <ellipse cx="50.5" cy="20" rx="4.5" ry="5.5" fill="#e0a870"/>
  <ellipse cx="9.5" cy="20" rx="2.5" ry="3.5" fill="#c8895a"/>
  <ellipse cx="50.5" cy="20" rx="2.5" ry="3.5" fill="#c8895a"/>

  <!-- Hair (thin grey combover — swept from left across bald top) -->
  <path d="M9 18 Q24 4 46 12" stroke="#a8a8a8" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M9 20 Q25 7 45 15" stroke="#a8a8a8" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <path d="M10 22 Q27 10 44 18" stroke="#a8a8a8" stroke-width="1.0" fill="none" stroke-linecap="round"/>
  <!-- Hair origin on left side -->
  <path d="M9 18 Q7 13 9 9" stroke="#a8a8a8" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <path d="M10 20 Q8 15 10 12" stroke="#a8a8a8" stroke-width="1.1" fill="none" stroke-linecap="round"/>

${glassesSvg}
${eyesSvg}

  <!-- Nose -->
  <ellipse cx="30" cy="25.5" rx="2.8" ry="2" fill="#c88050"/>

  <!-- Smile -->
  <path d="M18 31 Q30 40 42 31" stroke="#a85e30" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="17" cy="30" r="1.2" fill="#c88050"/>
  <circle cx="43" cy="30" r="1.2" fill="#c88050"/>

  <!-- Cheek blush -->
  <ellipse cx="12" cy="26" rx="4.5" ry="3" fill="rgba(220,80,50,0.15)"/>
  <ellipse cx="48" cy="26" rx="4.5" ry="3" fill="rgba(220,80,50,0.15)"/>
${hatSvg}${accessorySvg}
</svg>`;

  if (!bubble) return svg;

  return `<div class="pete-bubble-wrap">
    <div class="pete-speech-bubble">${bubble}</div>
    ${svg}
  </div>`;
}

// Inject Pete into a container element by ID
function injectPete(containerId, heightPx, opts = {}) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = createPeteSVG(heightPx, opts);
}

// Small circular Pete head avatar for leaderboards/friend lists
function miniPeteIcon(wardrobe = {}, size = 30) {
  const SHIRT_COLORS = { default: ['#e8934a','#c87030'], red: ['#c83020','#8a1810'], blue: ['#3060c8','#1a3a8a'], green: ['#2a6e46','#1a4a30'], purple: ['#7040b8','#4a2080'], yellow: ['#c8a010','#8a6808'], black: ['#222222','#111111'], white: ['#e8e8e0','#c0c0b8'] };
  const [sc] = SHIRT_COLORS[wardrobe.shirt || 'default'] || SHIRT_COLORS.default;
  let hatSvg = '';
  if (wardrobe.hat === 'flatcap') hatSvg = `<ellipse cx="15" cy="7" rx="8" ry="3" fill="#6b3e18"/><rect x="7" y="6" width="16" height="3" rx="1.5" fill="#5a3010"/><ellipse cx="20" cy="9" rx="4" ry="1.2" fill="#5a3010"/>`;
  else if (wardrobe.hat === 'beanie') hatSvg = `<rect x="7" y="4" width="16" height="7" rx="5" fill="${sc}"/>`;
  else if (wardrobe.hat === 'cowboy') hatSvg = `<ellipse cx="15" cy="9" rx="10" ry="2.5" fill="#8b5a30"/><path d="M8 9 Q8.5 4 15 3.5 Q21.5 4 22 9 Z" fill="#6b3e18"/>`;
  else if (wardrobe.hat === 'tophat') hatSvg = `<rect x="10" y="1" width="10" height="8" rx="1" fill="#111"/><rect x="7" y="8" width="16" height="2.5" rx="1" fill="#111"/>`;
  else if (wardrobe.hat === 'gradcap') hatSvg = `<path d="M6 8 L15 3 L24 8 Z" fill="#1a1a4a"/><rect x="9" y="7" width="12" height="4" rx="0.5" fill="#1a1a4a"/>`;
  else if (wardrobe.hat === 'crown') hatSvg = `<path d="M7 9 L9 4 L12 7 L15 2 L18 7 L21 4 L23 9 Z" fill="#c8a010" stroke="#8a6808" stroke-width="0.6"/><rect x="7" y="9" width="16" height="3" rx="1" fill="#c8a010"/>`;
  else if (wardrobe.hat === 'pirate') hatSvg = `<path d="M5 10 Q8 5 11 7 Q15 4 19 7 Q22 5 25 10 Z" fill="#181818"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 30 30" fill="none" style="flex-shrink:0;display:block">
    <circle cx="15" cy="15" r="14" fill="#f5e0c0" stroke="#d4a870" stroke-width="1.2"/>
    <ellipse cx="15" cy="14" rx="8.5" ry="9" fill="#f0c890"/>
    <circle cx="11.5" cy="13.5" r="1.8" fill="#2a1a08"/>
    <circle cx="18.5" cy="13.5" r="1.8" fill="#2a1a08"/>
    <circle cx="12" cy="13" r="0.6" fill="white"/>
    <circle cx="19" cy="13" r="0.6" fill="white"/>
    <ellipse cx="15" cy="17" rx="2" ry="1.2" fill="#c88050"/>
    <path d="M11 20 Q15 23 19 20" stroke="#a85e30" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    ${hatSvg}
  </svg>`;
}
