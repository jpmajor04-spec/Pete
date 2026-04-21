// Pete — Wordsmith mascot
// A plump, bespectacled man in a colourful rugby shirt and sandals,
// named after a man at church who is exemplary with complex vocabulary.

let _peteId = 0;

function createPeteSVG(heightPx = 80, opts = {}) {
  const id = ++_peteId;
  const w = Math.round(heightPx * 0.78);
  const h = heightPx;
  const { flip = false, bubble = null } = opts;
  const transform = flip ? `transform="scale(-1,1) translate(-60,0)"` : '';

  const svg = `<svg width="${w}" height="${h}" viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg" class="pete-svg" aria-label="Pete the mascot" style="overflow:visible">
  <!-- Ground shadow -->
  <ellipse cx="30" cy="79" rx="13" ry="2.5" fill="rgba(100,55,15,0.13)"/>

  <!-- Legs -->
  <rect x="16" y="58" width="10" height="14" rx="5" fill="#e0a870" ${transform}/>
  <rect x="34" y="58" width="10" height="14" rx="5" fill="#e0a870" ${transform}/>

  <!-- Sandals -->
  <ellipse cx="21" cy="73" rx="9" ry="3.2" fill="#8b5a30"/>
  <rect x="13" y="68.5" width="16" height="2.8" rx="1.4" fill="#6b3e18"/>
  <rect x="18" y="66.5" width="7" height="3.5" rx="1.4" fill="#6b3e18"/>
  <ellipse cx="39" cy="73" rx="9" ry="3.2" fill="#8b5a30"/>
  <rect x="31" y="68.5" width="16" height="2.8" rx="1.4" fill="#6b3e18"/>
  <rect x="35" y="66.5" width="7" height="3.5" rx="1.4" fill="#6b3e18"/>

  <!-- Body — plump ellipse clipped with rugby stripes -->
  <ellipse cx="30" cy="47" rx="20" ry="16" fill="#c82200"/>
  <clipPath id="pb${id}"><ellipse cx="30" cy="47" rx="20" ry="16"/></clipPath>
  <g clip-path="url(#pb${id})">
    <rect x="10" y="36" width="40" height="5.5" fill="#c82200"/>
    <rect x="10" y="41.5" width="40" height="5.5" fill="#1a7a3a"/>
    <rect x="10" y="47" width="40" height="5.5" fill="#e8be10"/>
    <rect x="10" y="52.5" width="40" height="5.5" fill="#1a3aaa"/>
    <rect x="10" y="58" width="40" height="5.5" fill="#c82200"/>
    <rect x="10" y="63.5" width="40" height="5.5" fill="#1a7a3a"/>
  </g>

  <!-- Collar V -->
  <path d="M26 38 L30 44 L34 38" stroke="white" stroke-width="1.8" fill="none" stroke-linejoin="round"/>

  <!-- Arms -->
  <ellipse cx="11" cy="47" rx="5.5" ry="10" fill="#c82200"/>
  <clipPath id="la${id}"><ellipse cx="11" cy="47" rx="5.5" ry="10"/></clipPath>
  <g clip-path="url(#la${id})">
    <rect x="5" y="41.5" width="12" height="5.5" fill="#1a7a3a"/>
    <rect x="5" y="52.5" width="12" height="5.5" fill="#e8be10"/>
  </g>
  <ellipse cx="49" cy="47" rx="5.5" ry="10" fill="#1a7a3a"/>
  <clipPath id="ra${id}"><ellipse cx="49" cy="47" rx="5.5" ry="10"/></clipPath>
  <g clip-path="url(#ra${id})">
    <rect x="43" y="41.5" width="12" height="5.5" fill="#c82200"/>
    <rect x="43" y="52.5" width="12" height="5.5" fill="#1a3aaa"/>
  </g>

  <!-- Hands -->
  <circle cx="9" cy="58" r="4.5" fill="#e0a870"/>
  <circle cx="51" cy="58" r="4.5" fill="#e0a870"/>

  <!-- Neck -->
  <rect x="24.5" y="32" width="11" height="8" rx="4" fill="#e0a870"/>

  <!-- Head — plump round -->
  <ellipse cx="30" cy="20" rx="18" ry="20" fill="#e0a870"/>

  <!-- Ears -->
  <ellipse cx="12.5" cy="20" rx="4.5" ry="5.5" fill="#e0a870"/>
  <ellipse cx="47.5" cy="20" rx="4.5" ry="5.5" fill="#e0a870"/>
  <ellipse cx="12.5" cy="20" rx="2.5" ry="3.5" fill="#c8895a"/>
  <ellipse cx="47.5" cy="20" rx="2.5" ry="3.5" fill="#c8895a"/>

  <!-- Hair (sparse, thinning on top) -->
  <path d="M17 12 Q30 5 43 12" stroke="#5a3010" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M18 15 Q30 8 42 15" stroke="#5a3010" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- Wispy sides -->
  <path d="M17 13 Q15 9 17 7" stroke="#5a3010" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M43 13 Q45 9 43 7" stroke="#5a3010" stroke-width="1.8" fill="none" stroke-linecap="round"/>

  <!-- Glasses (round frames with light tint) -->
  <circle cx="22" cy="20" r="8" fill="rgba(180,215,255,0.22)" stroke="#3a2010" stroke-width="1.8"/>
  <circle cx="38" cy="20" r="8" fill="rgba(180,215,255,0.22)" stroke="#3a2010" stroke-width="1.8"/>
  <!-- Bridge -->
  <line x1="30" y1="19" x2="30" y2="21" stroke="#3a2010" stroke-width="1.8"/>
  <!-- Temples -->
  <line x1="13" y1="17" x2="15" y2="19" stroke="#3a2010" stroke-width="1.8"/>
  <line x1="45.5" y1="19" x2="47" y2="17" stroke="#3a2010" stroke-width="1.8"/>

  <!-- Eyes (friendly, warm) -->
  <circle cx="22" cy="20" r="3.8" fill="#1e1008"/>
  <circle cx="38" cy="20" r="3.8" fill="#1e1008"/>
  <circle cx="23" cy="18.5" r="1.3" fill="white"/>
  <circle cx="39" cy="18.5" r="1.3" fill="white"/>

  <!-- Nose (button) -->
  <ellipse cx="30" cy="25.5" rx="2.8" ry="2" fill="#c88050"/>

  <!-- Warm smile -->
  <path d="M21 31 Q30 39 39 31" stroke="#a85e30" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- Smile dimples -->
  <circle cx="20" cy="30" r="1.2" fill="#c88050"/>
  <circle cx="40" cy="30" r="1.2" fill="#c88050"/>

  <!-- Cheek blush -->
  <ellipse cx="15" cy="26" rx="4.5" ry="3" fill="rgba(220,80,50,0.15)"/>
  <ellipse cx="45" cy="26" rx="4.5" ry="3" fill="rgba(220,80,50,0.15)"/>
</svg>`;

  if (!bubble) return svg;

  // Wrap Pete + speech bubble in a container
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
