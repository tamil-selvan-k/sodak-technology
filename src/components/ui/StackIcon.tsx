import React from 'react'

const ICONS: Record<string, (size: number) => React.ReactElement> = {
  /* ── HTML5 shield — official brand paths ────────────────────────────────── */
  'full-stack-web': (s) => (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      <path d="M5.902 27.201L3.655 2h24.69l-2.25 25.197L15.985 30z" fill="#E44D26"/>
      <path d="M16 27.858l8.17-2.265 1.922-21.532H16z" fill="#F16529"/>
      <path d="M16 13.407h-4.09l-.282-3.165H16V7.151H8.38l.074.83.759 8.517H16zm0 8.489l-.014.004-3.442-.929-.22-2.465H9.221l.433 4.852 6.332 1.758.014-.004z" fill="#EBEBEB"/>
      <path d="M15.986 13.407v3.091h3.806l-.358 4.009-3.448.93v3.211l6.337-1.757.046-.522.728-8.145.076-.817zm0-6.256v3.091h7.466l.062-.694.141-1.567.074-.83z" fill="white"/>
    </svg>
  ),

  /* ── Spring Boot — green circle with leaf shape ─────────────────────────── */
  'java-spring-boot': (s) => (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="springGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6DB33F"/>
          <stop offset="100%" stopColor="#4A8C27"/>
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill="url(#springGrad)"/>
      {/* Stylised leaf — accurate Spring Boot motif */}
      <path
        d="M21.5 9.5C21.5 9.5 23.5 14 20 17.5C17 20.5 11 21 9 23C9 23 10.5 17 14 14.5C17 12.3 21.5 9.5 21.5 9.5Z"
        fill="white" opacity="0.95"
      />
      {/* Small accent circle at tip of spring coil */}
      <circle cx="21.5" cy="10" r="1.8" fill="white" opacity="0.6"/>
    </svg>
  ),

  /* ── Python — dual-body snake, official colour split ────────────────────── */
  'python-data-science': (s) => (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="pyTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#387EB8"/>
          <stop offset="100%" stopColor="#366994"/>
        </linearGradient>
        <linearGradient id="pyBot" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFE052"/>
          <stop offset="100%" stopColor="#FFC331"/>
        </linearGradient>
      </defs>
      <path d="M15.9 3C10.9 3 11.2 5.2 11.2 5.2V7.5h4.9v.8H8.8S5 7.8 5 12.9s3.3 4.9 3.3 4.9h2v-2.4s-.1-3.3 3.2-3.3h5.6s3.1.1 3.1-3V6C23.2 6 22.9 3 15.9 3zm-3.1 1.7c.6 0 1 .4 1 1s-.4 1-1 1-.9-.5-.9-1 .4-1 .9-1z" fill="url(#pyTop)"/>
      <path d="M16.1 29c5 0 4.7-2.2 4.7-2.2v-2.3h-4.9v-.8h7.3S27 24.2 27 19.1s-3.3-4.9-3.3-4.9h-2v2.4s.1 3.3-3.2 3.3h-5.6s-3.1-.1-3.1 3V26C9.8 26 10.1 29 16.1 29zm3.1-1.7c-.6 0-1-.4-1-1s.4-1 1-1 .9.5.9 1-.4 1-.9 1z" fill="url(#pyBot)"/>
    </svg>
  ),

  /* ── Docker — whale icon on brand blue ──────────────────────────────────── */
  'devops-cloud': (s) => (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#2496ED"/>
      {/* Container stacks */}
      <path d="M17.5 12h2.5v2.5h-2.5V12zM14 12h2.5v2.5H14V12zM10.5 12H13v2.5h-2.5V12zM17.5 8.5H20V11h-2.5V8.5zM14 8.5h2.5V11H14V8.5zM7 12h2.5v2.5H7V12z" fill="white"/>
      {/* Whale body */}
      <path d="M25.5 13.5c-.5-.3-1.7-.4-2.6-.2-.1-.9-.7-1.7-1.7-2.3l-.6-.3-.3.6c-.4.8-.5 1.9-.2 2.7-.3.1-.9.3-1.7.3H4.5c-.3 1.6.2 3.7 1.5 5.1 1.1 1.3 2.8 1.9 5 1.9 4.7 0 8.2-2.2 9.8-6.1.7 0 2.1 0 2.8-1.5l.1-.3-.2-.1v.2z" fill="white"/>
    </svg>
  ),

  /* ── Cybersecurity — solid shield with keyhole, all fills ───────────────── */
  'cybersecurity': (s) => (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DC2626"/>
          <stop offset="100%" stopColor="#991B1B"/>
        </linearGradient>
      </defs>
      {/* Shield outline */}
      <path d="M16 3L5 7.5V15C5 21.5 9.9 27.1 16 29C22.1 27.1 27 21.5 27 15V7.5L16 3Z" fill="url(#shieldGrad)"/>
      {/* Left face — slightly lighter for depth */}
      <path d="M16 3L5 7.5V15C5 21.5 9.9 27.1 16 29V3Z" fill="#DC2626"/>
      {/* Lock body */}
      <rect x="11.5" y="16.5" width="9" height="7" rx="1.5" fill="white"/>
      {/* Lock shackle */}
      <path d="M13.5 16.5V14A2.5 2.5 0 0118.5 14V16.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* Keyhole */}
      <circle cx="16" cy="19.5" r="1.3" fill="#DC2626"/>
      <rect x="15.3" y="20.6" width="1.4" height="1.6" rx="0.5" fill="#DC2626"/>
    </svg>
  ),

  /* ── Mobile Development — phone with React-Native atom rings ────────────── */
  'mobile-development': (s) => (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="phoneGrad" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#3B82F6"/>
          <stop offset="100%" stopColor="#1E40AF"/>
        </linearGradient>
      </defs>
      {/* Phone shell */}
      <rect x="8" y="2" width="16" height="28" rx="3.5" fill="url(#phoneGrad)"/>
      {/* Screen bezel */}
      <rect x="10" y="6" width="12" height="19" rx="1" fill="white" opacity="0.1"/>
      {/* Top speaker pill */}
      <rect x="13.5" y="3" width="5" height="1.5" rx="0.75" fill="white" opacity="0.35"/>
      {/* Bottom home bar */}
      <rect x="13" y="26.5" width="6" height="1" rx="0.5" fill="white" opacity="0.5"/>
      {/* React Native atom — nucleus */}
      <circle cx="16" cy="15.5" r="1.8" fill="white" opacity="0.9"/>
      {/* Three elliptical orbits */}
      <ellipse cx="16" cy="15.5" rx="5.5" ry="2" stroke="white" strokeWidth="1" opacity="0.55" fill="none"/>
      <ellipse cx="16" cy="15.5" rx="5.5" ry="2" stroke="white" strokeWidth="1" opacity="0.55" fill="none" transform="rotate(60 16 15.5)"/>
      <ellipse cx="16" cy="15.5" rx="5.5" ry="2" stroke="white" strokeWidth="1" opacity="0.55" fill="none" transform="rotate(120 16 15.5)"/>
    </svg>
  ),

  /* ── DSA — binary tree, precise geometry, Linear/Stripe aesthetic ────────── */
  'dsa': (s) => (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="dsaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7C3AED"/>
          <stop offset="100%" stopColor="#5B21B6"/>
        </linearGradient>
      </defs>
      {/* Edges — drawn beneath nodes */}
      <line x1="16" y1="8"  x2="9"  y2="15.5" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16" y1="8"  x2="23" y2="15.5" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="9"  y1="18" x2="5.5" y2="24.5" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <line x1="9"  y1="18" x2="12.5" y2="24.5" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <line x1="23" y1="18" x2="19.5" y2="24.5" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <line x1="23" y1="18" x2="26.5" y2="24.5" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      {/* Level 1 — root */}
      <circle cx="16"  cy="5.5" r="3"   fill="url(#dsaGrad)"/>
      {/* Level 2 */}
      <circle cx="9"   cy="17"  r="2.5" fill="#7C3AED"/>
      <circle cx="23"  cy="17"  r="2.5" fill="#7C3AED"/>
      {/* Level 3 — leaves, reduced opacity for hierarchy */}
      <circle cx="5.5"  cy="26.5" r="2" fill="#7C3AED" opacity="0.6"/>
      <circle cx="12.5" cy="26.5" r="2" fill="#7C3AED" opacity="0.6"/>
      <circle cx="19.5" cy="26.5" r="2" fill="#7C3AED" opacity="0.6"/>
      <circle cx="26.5" cy="26.5" r="2" fill="#7C3AED" opacity="0.6"/>
    </svg>
  ),

  /* ── System Design — distributed nodes, Stripe/Vercel design language ───── */
  'system-design': (s) => (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="sdGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0EA5E9"/>
          <stop offset="100%" stopColor="#0369A1"/>
        </linearGradient>
      </defs>
      {/* Connector lines — drawn first */}
      <line x1="16" y1="8"  x2="16" y2="12" stroke="#0EA5E9" strokeWidth="1.5"/>
      <line x1="16" y1="20" x2="16" y2="24" stroke="#0EA5E9" strokeWidth="1.5"/>
      <line x1="8"  y1="16" x2="12" y2="16" stroke="#0EA5E9" strokeWidth="1.5"/>
      <line x1="20" y1="16" x2="24" y2="16" stroke="#0EA5E9" strokeWidth="1.5"/>
      <line x1="7.8" y1="7.8" x2="12" y2="12" stroke="#0EA5E9" strokeWidth="1" opacity="0.45"/>
      <line x1="24.2" y1="24.2" x2="20" y2="20" stroke="#0EA5E9" strokeWidth="1" opacity="0.45"/>
      {/* Centre node — primary */}
      <rect x="12" y="12" width="8" height="8" rx="2" fill="url(#sdGrad)"/>
      {/* Cardinal nodes */}
      <rect x="13" y="3"  width="6" height="5" rx="1.5" fill="#0EA5E9" opacity="0.85"/>
      <rect x="13" y="24" width="6" height="5" rx="1.5" fill="#0EA5E9" opacity="0.85"/>
      <rect x="3"  y="13" width="5" height="6" rx="1.5" fill="#0EA5E9" opacity="0.85"/>
      <rect x="24" y="13" width="5" height="6" rx="1.5" fill="#0EA5E9" opacity="0.85"/>
      {/* Diagonal peripheral nodes */}
      <circle cx="6"  cy="6"  r="2.5" fill="#0EA5E9" opacity="0.4"/>
      <circle cx="26" cy="26" r="2.5" fill="#0EA5E9" opacity="0.4"/>
    </svg>
  ),

  /* ── Amazon — orange brand square with accurate smile-arrow motif ─────────── */
  'amazon-training': (s) => (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#FF9900"/>
      {/* Package / box — represents Amazon deliveries + FAANG */}
      <rect x="9.5" y="7" width="13" height="11" rx="1.5" stroke="white" strokeWidth="1.8" fill="none"/>
      <line x1="9.5" y1="11.5" x2="22.5" y2="11.5" stroke="white" strokeWidth="1.8"/>
      <line x1="16"  y1="7"    x2="16"   y2="11.5" stroke="white" strokeWidth="1.8"/>
      {/* Amazon smile arrow — a-to-z curved arrow, the brand's defining motif */}
      <path d="M8 23C10.5 27.5 21.5 27.5 24 23" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Arrowhead */}
      <path d="M21.5 21L24.5 23L22 26" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  /* ── Zoho — Zoho red square with bold diagonal Z letterform ─────────────── */
  'zoho-training': (s) => (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#E8442E"/>
      {/* Bold Z — clean diagonal letterform matching Zoho brand */}
      <path
        d="M8 9H24L12 23H24"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  ),
}

const DEFAULT_ICON = (s: number): React.ReactElement => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
  </svg>
)

export default function StackIcon({ slug, size = 32 }: { slug: string; size?: number }) {
  const render = ICONS[slug] ?? DEFAULT_ICON
  return render(size)
}
