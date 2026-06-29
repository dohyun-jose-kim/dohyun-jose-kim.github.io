import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { CONTENT, LIFE_IDS, NAV, SOCIALS } from './content';
import type { LifeId } from './content';

type Theme = 'dark' | 'light';
type Lang = 'ko' | 'en';

// ▼ FLIP CARD TUNING
const FLIP_SCALE = 2; // base zoom for a flipped Life card (auto-reduced for 2-col / 1-col layouts)
const CENTER_PULL = 0.25; // 0 = grow in place · 0.5 = strongest pull toward page center

// ▼ EXPERIENCE MASTER-DETAIL TUNING — the whole timeline motion lives here
const EXP = {
  detailWidth: 1060, // px — section max-width
  rowH: 184, // px — FIXED row height (no vertical jolt on toggle)
  railW: 340, // px — left box (year/title)
  railShift: 16, // px — collapsed: nudge the title rail toward the axis (small, to keep clear of the detailTitle)
  pad: 30, // px — content top padding inside each row
  axisSummary: 72, // % — axis x when collapsed
  axisDetail: 40, // % — axis x when expanded (~32% horizontal travel)
  detailGap: 32, // px — gap from axis to the detail bullets
  detailSize: 12, // px — bullet text size
  titleSize: 17, // px — rail title size
  // ▼ flying heading (detailTitle)
  headW: 300, // px — heading width
  headLeftCollapsedGap: 30, // px — collapsed: right edge sits this far LEFT of the axis (relative, so it tracks the axis)
  headTopCollapsed: 96, // px — collapsed y
  headTopExpanded: 30, // px — expanded y (top of the bullet column)
};

// Timeline is the PRIMARY view; the accordion is a fallback for genuinely narrow widths only (#26).
const NARROW_EXP = 910; // px — Experience width below which it falls back to a stacked accordion
const NARROW_NAV = 1320; // px — root width below which the sidebar collapses into an overlay.
// Kept high so the sidebar always collapses BEFORE the accordion appears (#25), and so the
// collapsed flying timeline stays overlap-free while the sidebar is still present.
const CHIPS_3COL_MIN = 500; // px — Fields-of-interest chip area width needed for 3 columns (#23)

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- per-hobby signature icon (line-art, dim → accent on hover) ---- */
function Motif({ id, on }: { id: LifeId; on: boolean }) {
  const col = on ? 'var(--accent)' : 'var(--fg3)';
  const acc = on ? 'var(--accent)' : 'var(--fg2)';
  const lift: CSSProperties = {
    transform: on ? 'translateY(-2px)' : 'none',
    transition: 'transform .45s cubic-bezier(.2,.7,.2,1), stroke .4s',
  };
  const base = {
    fill: 'none',
    stroke: col,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (id === 'run') {
    // triathlon — swim in water · road bike · runner (detailed)
    const sk = { ...base, strokeWidth: 1.5 };
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, ...lift }}>
        <svg width={43} height={28} viewBox="0 0 34 22" {...sk}>
          <circle cx="22" cy="9.5" r="2" />
          <path d="M23.6 8.6 L29 6.2" />
          <path d="M20.2 10 C16.5 11.2 12.5 10.8 8.5 11.6" />
          <path d="M18.4 10 L16.2 7 L13.2 8.2" />
          <path d="M8.5 11.6 L4.2 12.3" />
          <path d="M6.2 11.9 L3.4 13.6" />
          <path d="M1 16.8 C3 15.3 5 15.3 7 16.8 C9 18.3 11 18.3 13 16.8 C15 15.3 17 15.3 19 16.8 C21 18.3 23 18.3 25 16.8" />
          <path d="M3 19 C5 17.6 7 17.6 9 19 C11 20.4 13 20.4 15 19" />
        </svg>
        <svg width={44} height={33} viewBox="0 0 32 24" {...sk}>
          <circle cx="6" cy="18" r="4" />
          <circle cx="26" cy="18" r="4" />
          <circle cx="13.5" cy="18" r="1" />
          <path d="M6 18 L13.5 18 L11 10 L19 10" />
          <path d="M11 10 L13.5 18" />
          <path d="M13.5 18 L19 10" />
          <path d="M19 10 L26 18" />
          <circle cx="17.5" cy="4" r="2" />
          <path d="M16 5.8 L11.4 10" />
          <path d="M16.4 6.4 L20 10" />
          <path d="M13.5 18 L15 13 L11.4 10" />
          <path d="M19 10.2 C20.6 9.2 21.4 9.8 21 11" />
        </svg>
        <svg width={31} height={31} viewBox="0 0 24 24" {...sk}>
          <circle cx="15" cy="4" r="2" />
          <path d="M14 5.9 L10.8 12" />
          <path d="M12.8 7.4 L16.6 6.9 L17.8 9.4" />
          <path d="M12 8.6 L8.4 7.6 L8 5.2" />
          <path d="M10.8 12 L14.6 13.4 L13 17.8 L14.6 20" />
          <path d="M10.8 12 L7 14.4 L8.4 18" />
          <path d="M3 20.6 L21 20.6" />
        </svg>
      </div>
    );
  }
  if (id === 'drum') {
    return (
      <svg width={46} height={46} viewBox="0 0 24 24" {...base} strokeWidth={1.3} style={lift}>
        <path d="M3.4 20.5 L4.6 7.8" />
        <ellipse cx="4.6" cy="7" rx="3.1" ry="0.9" stroke={acc} />
        <path d="M20.6 20.5 L19.2 6.8" />
        <ellipse cx="19.2" cy="6" rx="3.3" ry="0.95" stroke={acc} />
        <circle cx="17.8" cy="15.2" r="2.7" />
        <path d="M16 17.6 L15.4 20.5 M19.6 17.6 L20.2 20.5" />
        <ellipse cx="8" cy="9.5" rx="2.4" ry="1.9" />
        <ellipse cx="13.2" cy="9.5" rx="2.4" ry="1.9" />
        <circle cx="10.6" cy="16.6" r="5" />
        <circle cx="10.6" cy="16.6" r="1.4" stroke={acc} />
        <path d="M6.4 20.8 L7.8 18 M14.8 20.8 L13.4 18" />
      </svg>
    );
  }
  if (id === 'words') {
    return (
      <svg width={40} height={40} viewBox="0 0 24 24" {...base} strokeWidth={1.5} style={lift}>
        <path d="M12 6.6 C10 5.1, 6.6 4.7, 4 5.3 L4 17.4 C6.6 16.8 10 17.2 12 18.7" />
        <path d="M12 6.6 C14 5.1, 17.4 4.7, 20 5.3 L20 17.4 C17.4 16.8 14 17.2 12 18.7" />
        <path d="M12 6.6 L12 18.7" stroke={acc} />
      </svg>
    );
  }
  if (id === 'outdoor') {
    // equestrian · sailing · hiking
    const sk = { ...base, strokeWidth: 1.6 };
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, ...lift }}>
        <svg width={30} height={30} viewBox="0 0 24 24" {...sk}>
          <path d="M4.5 12 C5.5 9.5 7 8.5 9 7.2 C10.5 6.2 12 5.4 13.4 5 L13.7 2.2 C13.8 1.8 14.4 1.9 14.5 2.3 L15 4.8 L15.8 4.4 C15.9 4 16.5 4 16.7 4.4 L17.4 2.6 C17.6 2.2 18.1 2.4 18.1 2.8 L18 5.6 C19.2 6.6 19.9 8.4 20.2 10.6 C20.5 13 20.6 18 20.6 22" />
          <path d="M9 12.2 C8.2 12.2 7.6 12.8 7.2 13.6 C6.4 14.2 5.4 14.2 4.7 13.4 C4.3 13 4.2 12.4 4.5 12" />
          <path d="M12 13.8 C11.2 12.7 10.2 12.2 9 12.2" />
          <circle cx="11.6" cy="9" r="0.7" fill={col} stroke="none" />
        </svg>
        <svg width={24} height={24} viewBox="0 0 24 24" {...sk}>
          <path d="M12.5 3 L12.5 14 L4.5 14 Z" />
          <path d="M6 14.4 L18 14.4 L15.6 17.4 L8.4 17.4 Z" />
          <path d="M3 19.4 C6.5 21, 17.5 21, 21 19.4" stroke={acc} />
        </svg>
        <svg width={26} height={26} viewBox="0 0 24 24" {...sk}>
          <path d="M2.5 19.5 L10 6.5 L14 13.5 L16.5 9 L21.5 19.5 Z" />
          <path d="M8.1 10 L10 6.5 L11.9 10" stroke={acc} />
        </svg>
      </div>
    );
  }
  if (id === 'arts') {
    return (
      <svg width={40} height={40} viewBox="0 0 24 24" {...base} strokeWidth={1.7} style={{ transition: 'stroke .4s' }}>
        <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" />
        <path d="M8 7.5 L9.4 5 L14.6 5 L16 7.5" />
        <circle cx="12" cy="13.8" r="3.4" stroke={acc} />
      </svg>
    );
  }
  // tbd → "+"
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px dashed var(--border-strong)',
        fontSize: 19.8,
        color: 'var(--fg3)',
        transform: on ? 'rotate(45deg)' : 'none',
        transition: 'transform .45s cubic-bezier(.2,.7,.2,1)',
      }}
    >
      +
    </div>
  );
}

function ThemeIcon({ theme }: { theme: Theme }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  if (theme === 'dark') {
    return (
      <svg {...common}>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

const MONO_LABEL: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10.8,
  letterSpacing: '.22em',
  textTransform: 'uppercase',
};

export default function App() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [lang, setLang] = useState<Lang>('en');
  const [hovered, setHovered] = useState<LifeId | null>(null);
  const [active, setActive] = useState('hero');
  const [flipped, setFlipped] = useState<LifeId | null>(null);
  const [expExpanded, setExpExpanded] = useState(false);
  const [expOpenIdx, setExpOpenIdx] = useState<number | null>(null); // #24: accordion (narrow) opens one at a time
  const [chipsCols, setChipsCols] = useState(3); // #23: Fields-of-interest 3 → 2 columns
  const [lifeCols, setLifeCols] = useState(3);
  const [expNarrow, setExpNarrow] = useState(false);
  const [navNarrow, setNavNarrow] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const expWrapRef = useRef<HTMLDivElement | null>(null);
  const chipsWrapRef = useRef<HTMLDivElement | null>(null);
  const moveTick = useRef(false);
  const headRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bulletRefs = useRef<(HTMLUListElement | null)[]>([]);
  const [headHeights, setHeadHeights] = useState<number[]>([]);
  const [bulletHeights, setBulletHeights] = useState<number[]>([]);

  const C = CONTENT[lang];

  /* restore saved theme / language */
  useEffect(() => {
    try {
      const t = localStorage.getItem('blog-theme') as Theme | null;
      if (t) setTheme(t);
      const l = localStorage.getItem('blog-lang') as Lang | null;
      if (l) setLang(l);
    } catch {
      /* ignore */
    }
  }, []);

  /* keep <html lang> in sync with language toggle (a11y / SEO) */
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  /* #20 — measure flying headings + bullet blocks so rows fit 2-line headings
     and wrapped bullets (e.g. long official names) without clipping */
  useLayoutEffect(() => {
    if (expNarrow) return;
    const measure = () => {
      setHeadHeights(headRefs.current.map((el) => (el ? el.offsetHeight : 0)));
      setBulletHeights(bulletRefs.current.map((el) => (el ? el.offsetHeight : 0)));
    };
    measure();
    document.fonts?.ready.then(measure); // re-measure once web fonts settle (wrap may change)
    let raf = 0;
    const onResize = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(raf); };
  }, [lang, expNarrow]);

  /* scroll-linked nav highlight */
  useEffect(() => {
    let ticking = false;
    const update = () => {
      const probe = window.scrollY + window.innerHeight * 0.42;
      let cur = 'hero';
      for (const n of NAV) {
        const el = document.getElementById(n.id);
        if (el && probe >= el.offsetTop) cur = n.id;
      }
      setActive(cur);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* responsive layout: Life columns, narrow Experience, collapsing sidebar */
  useEffect(() => {
    const measure = () => {
      const grid = gridRef.current;
      if (grid) {
        const tpl = window.getComputedStyle(grid).gridTemplateColumns || '';
        const c = tpl.split(' ').filter((x) => x && x !== '0px').length;
        if (c) setLifeCols(c);
      }
      const root = rootRef.current;
      const navNarrowNow = root ? root.clientWidth < NARROW_NAV : false;
      setNavNarrow(navNarrowNow);
      if (!navNarrowNow) setNavOpen(false);
      // #25/#26: Experience falls back to the accordion only AFTER the sidebar has collapsed,
      // and only when it is then too narrow for the flying timeline.
      const expW = expWrapRef.current?.clientWidth ?? 99999;
      setExpNarrow(navNarrowNow && expW < NARROW_EXP);
      // #23: Fields-of-interest chips — 3 columns when they fit, else 2 (never 4+2 / ragged).
      const chipsW = chipsWrapRef.current?.clientWidth ?? 0;
      if (chipsW) setChipsCols(chipsW >= CHIPS_3COL_MIN ? 3 : 2);
    };
    measure();
    window.addEventListener('resize', measure, { passive: true });
    const t = window.setTimeout(measure, 400); // re-measure after fonts settle
    return () => {
      window.removeEventListener('resize', measure);
      window.clearTimeout(t);
    };
  }, []);

  /* cursor spotlight (dark mode) */
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (moveTick.current) return;
      moveTick.current = true;
      requestAnimationFrame(() => {
        const el = rootRef.current;
        if (el) {
          el.style.setProperty('--mx', `${e.clientX}px`);
          el.style.setProperty('--my', `${e.clientY}px`);
        }
        moveTick.current = false;
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  /* Esc closes the overlay nav, then the flipped Life card */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (navOpen) setNavOpen(false);
      else if (flipped) setFlipped(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flipped, navOpen]);

  /* v0.2.3 — scroll-reveal: each section's content fades + rises in as it enters view */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReduced()) return;
    const reveals = Array.from(root.querySelectorAll('main > section'))
      .map((s) => s.querySelector(':scope > div') as HTMLElement | null)
      .filter((el): el is HTMLElement => !!el);
    reveals.forEach((el) => {
      delete el.dataset.shown; // re-arm on (re)mount — StrictMode runs effects twice in dev
      el.style.opacity = '0';
      el.style.transform = 'translateY(22px)';
      el.style.transition = 'opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1)';
    });
    const check = () => {
      const vh = window.innerHeight || 800;
      reveals.forEach((el) => {
        if (el.dataset.shown) return;
        if (el.getBoundingClientRect().top < vh * 0.88) {
          el.style.opacity = '1';
          el.style.transform = 'none';
          el.dataset.shown = '1';
        }
      });
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check, { passive: true });
    const t = window.setTimeout(check, 400);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
      window.clearTimeout(t);
    };
  }, []);

  const toggleTheme = () =>
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('blog-theme', next);
      } catch {
        /* ignore */
      }
      return next;
    });
  const toggleLang = () =>
    setLang((l) => {
      const next = l === 'ko' ? 'en' : 'ko';
      try {
        localStorage.setItem('blog-lang', next);
      } catch {
        /* ignore */
      }
      return next;
    });
  const toggleFlip = (id: LifeId) => setFlipped((f) => (f === id ? null : id));
  const toggleExp = () => setExpExpanded((v) => !v);

  const expLabel = expExpanded ? (lang === 'ko' ? '접기' : 'Collapse') : lang === 'ko' ? '펼쳐보기' : 'Expand';
  const expIcon = expExpanded ? '⤢' : '⤡';
  const expHint = expExpanded ? 'CLICK TO COLLAPSE' : 'CLICK TO EXPAND';

  const sectionStyle: CSSProperties = {
    minHeight: '100vh',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    padding: '96px 8vw',
  };

  // shared Experience geometry
  const axis = expExpanded ? EXP.axisDetail : EXP.axisSummary;
  const detailLeft = `calc(${axis}% + ${EXP.detailGap}px)`;
  const headLeft = expExpanded
    ? detailLeft
    : `calc(${EXP.axisSummary}% - ${EXP.headLeftCollapsedGap + EXP.headW}px)`;
  const headTop = expExpanded ? EXP.headTopExpanded : EXP.headTopCollapsed;
  const nodeTop = (expExpanded ? EXP.headTopExpanded : EXP.headTopCollapsed) + 6;

  const navLink = (n: { id: string; label: string }, onClick?: () => void) => {
    const onState = active === n.id;
    return (
      <a
        key={n.id}
        href={`#${n.id}`}
        onClick={onClick}
        style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', cursor: 'pointer' }}
      >
        <span
          style={{
            display: 'block',
            height: 1,
            width: onState ? 34 : 14,
            background: onState ? 'var(--accent)' : 'var(--border-strong)',
            transition: 'width .4s cubic-bezier(.2,.7,.2,1), background .4s',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10.8,
            letterSpacing: '.06em',
            color: onState ? 'var(--fg)' : 'var(--fg3)',
            transition: 'color .4s',
          }}
        >
          {n.label}
        </span>
      </a>
    );
  };

  return (
    <div
      ref={rootRef}
      data-theme={theme}
      style={{
        position: 'relative',
        background: 'var(--bg)',
        color: 'var(--fg)',
        fontFamily: 'var(--font-body)',
        minHeight: '100vh',
        display: 'flex',
        overflowX: 'clip',
        transition: 'color .5s ease',
      }}
    >
      {/* ambient: cursor spotlight (dark) */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background: 'radial-gradient(600px circle at var(--mx,50%) var(--my,30%), var(--spot), transparent 72%)',
          transition: 'background .3s ease',
        }}
      />
      {/* ambient: clouds (light) */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 'var(--cloud-op)', transition: 'opacity .6s ease' }}>
        <svg width="100%" height="100%" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id="cl" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="1" stopColor="#eaf4ff" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <g fill="url(#cl)">
            <ellipse cx="1180" cy="560" rx="360" ry="180" />
            <ellipse cx="980" cy="640" rx="300" ry="150" />
            <ellipse cx="1340" cy="660" rx="280" ry="150" />
            <ellipse cx="220" cy="780" rx="420" ry="200" />
            <ellipse cx="640" cy="850" rx="520" ry="220" />
          </g>
          <g fill="#ffffff" opacity="0.55">
            <ellipse cx="1080" cy="720" rx="420" ry="190" />
            <ellipse cx="400" cy="860" rx="520" ry="220" />
          </g>
        </svg>
      </div>

      {/* top-right toggles */}
      <div style={{ position: 'fixed', top: 22, right: 24, zIndex: 6, display: 'flex', gap: 10 }}>
        <button
          onClick={toggleLang}
          aria-label="Toggle language"
          style={{
            height: 46,
            minWidth: 46,
            padding: '0 14px',
            borderRadius: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 10.8,
            letterSpacing: '.1em',
            fontWeight: 500,
            background: 'var(--card-bg)',
            border: '1px solid var(--border-strong)',
            color: 'var(--fg2)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          {lang === 'ko' ? 'KR' : 'EN'}
        </button>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-strong)',
            color: 'var(--fg2)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <ThemeIcon theme={theme} />
        </button>
      </div>

      {/* LEFT: sticky TOC — hidden when narrow */}
      {!navNarrow && (
        <nav
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            width: 168,
            flex: '0 0 168px',
            alignSelf: 'flex-start',
            height: '100vh',
            boxSizing: 'border-box',
            padding: '48px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 64,
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, letterSpacing: '.01em', color: 'var(--fg)' }}>{C.heroName}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>{NAV.map((n) => navLink(n))}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.14em', color: 'var(--fg3)', lineHeight: 1.8, opacity: 0.7 }}>
            2026 · v0.2.7
            <br />
            VITE · REACT · TS
          </div>
        </nav>
      )}

      {/* NARROW: hamburger + slide-in overlay */}
      {navNarrow && (
        <>
          <button
            onClick={() => setNavOpen(true)}
            aria-label="Open menu"
            style={{
              position: 'fixed',
              top: 22,
              left: 20,
              zIndex: 7,
              width: 46,
              height: 46,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              background: 'var(--card-bg)',
              border: '1px solid var(--border-strong)',
              color: 'var(--fg2)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <MenuIcon />
          </button>
          <div
            onClick={() => setNavOpen(false)}
            aria-hidden
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 8,
              background: 'rgba(5,11,22,.55)',
              opacity: navOpen ? 1 : 0,
              pointerEvents: navOpen ? 'auto' : 'none',
              transition: 'opacity .35s ease',
            }}
          />
          <nav
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              zIndex: 9,
              width: 248,
              maxWidth: '82vw',
              boxSizing: 'border-box',
              padding: '36px 28px',
              background: 'var(--bg)',
              borderRight: '1px solid var(--border-strong)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 56,
              transform: navOpen ? 'translateX(0)' : 'translateX(-102%)',
              transition: 'transform .42s cubic-bezier(.2,.7,.2,1)',
            }}
          >
            <button
              onClick={() => setNavOpen(false)}
              aria-label="Close menu"
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                width: 38,
                height: 38,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: 'transparent',
                border: '1px solid var(--border-strong)',
                color: 'var(--fg2)',
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
              }}
            >
              ✕
            </button>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, letterSpacing: '.01em', color: 'var(--fg)' }}>{C.heroName}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>{NAV.map((n) => navLink(n, () => setNavOpen(false)))}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.14em', color: 'var(--fg3)', lineHeight: 1.8, opacity: 0.7 }}>
              2026 · v0.2.7
              <br />
              VITE · REACT · TS
            </div>
          </nav>
        </>
      )}

      {/* RIGHT: longscroll */}
      <main style={{ position: 'relative', zIndex: 1, flex: '1 1 auto', minWidth: 0, containerType: 'inline-size' } as CSSProperties}>
        {/* 01 HERO */}
        <section id="hero" style={sectionStyle}>
          <div style={{ maxWidth: 720, width: '100%' }}>
            <div style={{ ...MONO_LABEL, color: 'var(--accent)', marginBottom: 28 }}>— 01 / I am</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(30px,10cqw,82.8px)', lineHeight: 1.02, margin: 0, letterSpacing: '-.01em', color: 'var(--fg)' }}>{C.heroName}</h1>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(19.8px,3vw,27px)', color: 'var(--accent)', margin: '24px 0 0', fontWeight: 400 }}>{C.identity}</p>
            <p style={{ fontSize: 14.4, lineHeight: 1.7, color: 'var(--fg2)', maxWidth: 440, margin: '22px 0 0' }}>{C.heroSub}</p>
            <div style={{ marginTop: 64, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--fg3)', fontFamily: 'var(--font-mono)', fontSize: 9.9, letterSpacing: '.14em' }}>
              <span style={{ display: 'block', width: 1, height: 36, background: 'linear-gradient(var(--fg3), transparent)' }} />
              SCROLL
            </div>
          </div>
        </section>

        {/* 02 ABOUT */}
        <section id="about" style={sectionStyle}>
          <div style={{ maxWidth: 720, width: '100%' }}>
            <div style={{ ...MONO_LABEL, color: 'var(--fg2)', marginBottom: 36 }}>— 02 / About</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {C.about.map((line, i) => (
                <p key={i} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px,2.4vw,23.4px)', lineHeight: 1.55, margin: 0, color: 'var(--fg)', whiteSpace: 'pre-line' }}>{line}</p>
              ))}
            </div>
            <div style={{ marginTop: 44 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 14 }}>{C.stackLabel}</div>
              {/* #23: single grid → 3 cols (3+3) when they fit, else 2 (2+2+2). Never ragged/4+2. */}
              <div ref={chipsWrapRef} style={{ display: 'grid', gridTemplateColumns: `repeat(${chipsCols}, max-content)`, gap: 8, justifyContent: 'start' }}>
                {[...C.chipsRow1, ...C.chipsRow2].map((chip) => (
                  <span key={chip} style={{ fontFamily: 'var(--font-mono)', fontSize: 10.8, color: 'var(--fg2)', padding: '6px 12px', border: '1px solid var(--border-strong)', borderRadius: 999, whiteSpace: 'nowrap', textAlign: 'center' }}>{chip}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 03 EXPERIENCE */}
        <section id="exp" style={sectionStyle}>
          <div ref={expWrapRef} style={{ width: '100%', maxWidth: EXP.detailWidth }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 40 }}>
              <div style={{ ...MONO_LABEL, color: 'var(--fg2)' }}>— 03 / Experience</div>
              {/* #24: master toggle only in the wide timeline; the narrow accordion opens rows one at a time */}
              {!expNarrow && (
              <button
                onClick={toggleExp}
                aria-label="Toggle experience detail"
                style={{
                  flex: '0 0 auto',
                  minWidth: 128,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: 'transparent',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 999,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9.9,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  color: 'var(--fg2)',
                  transition: 'color .35s, border-color .35s',
                }}
              >
                {expLabel} <span style={{ fontSize: 11.7 }}>{expIcon}</span>
              </button>
              )}
            </div>

            {/* WIDE — absolute timeline */}
            {!expNarrow && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {C.experience.map((item, i) => {
                  const title = item.title.split(' · ').join('\n· ');
                  const titleSize = item.child ? Math.max(13, EXP.titleSize - 1.5) : EXP.titleSize;
                  // #20 — bullets clear the (possibly 2-line) heading; row grows to fit wrapped content
                  const headH = headHeights[i] || 21;
                  const rowBulletsTop = expExpanded ? EXP.headTopExpanded + headH + 9 : EXP.pad;
                  // grow only when expanded (collapsed stays compact + uniform → no large gaps)
                  const rowHeight = expExpanded ? Math.max(EXP.rowH, EXP.headTopExpanded + headH + 9 + (bulletHeights[i] || 0) + 16) : EXP.rowH;
                  return (
                    <div
                      key={i}
                      onClick={toggleExp}
                      style={{ position: 'relative', height: rowHeight, borderTop: item.child ? '1px solid transparent' : '1px solid var(--border)', cursor: 'pointer', overflow: 'hidden' }}
                    >
                      {/* RAIL */}
                      <div style={{ position: 'absolute', top: EXP.pad, left: 0, width: EXP.railW, boxSizing: 'border-box', paddingRight: 24, paddingLeft: item.child ? 26 : 0, transform: expExpanded ? 'translateX(0)' : `translateX(${EXP.railShift}px)`, transition: 'transform .6s cubic-bezier(.2,.7,.2,1)' }}>
                        {item.child && <span style={{ position: 'absolute', left: 2, top: -1, color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1 }}>↳</span>}
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.2, letterSpacing: '.04em', color: 'var(--accent)' }}>{item.year}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: titleSize, fontWeight: 600, lineHeight: 1.25, color: 'var(--fg)', marginTop: 8, whiteSpace: 'pre-line' }}>{title}</div>
                      </div>

                      {/* FLYING HEADING */}
                      <div ref={(el) => { headRefs.current[i] = el; }} style={{ position: 'absolute', width: EXP.headW, top: headTop, left: headLeft, textAlign: expExpanded ? 'left' : 'right', fontFamily: 'var(--font-display)', fontSize: 14, lineHeight: 1.45, color: 'var(--fg2)', transition: 'left .6s cubic-bezier(.2,.7,.2,1), top .6s cubic-bezier(.2,.7,.2,1)', willChange: 'left, top', pointerEvents: 'none' }}>{item.detailTitle}</div>

                      {/* AXIS + node */}
                      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${axis}%`, width: 1, background: 'var(--border-strong)', transition: 'left .6s cubic-bezier(.2,.7,.2,1)' }}>
                        <div style={{ position: 'absolute', left: -3.5, top: nodeTop, width: 8, height: 8, borderRadius: '50%', background: expExpanded ? 'var(--accent)' : 'var(--border-strong)', transform: expExpanded ? 'scale(1.3)' : 'scale(1)', transition: 'background .4s, transform .4s, top .55s cubic-bezier(.2,.7,.2,1)' }} />
                      </div>

                      {/* DETAIL bullets */}
                      <div style={{ position: 'absolute', top: rowBulletsTop, left: detailLeft, right: 8, opacity: expExpanded ? 1 : 0, transform: expExpanded ? 'translateX(0)' : 'translateX(24px)', transition: 'opacity .45s ease, left .6s cubic-bezier(.2,.7,.2,1), transform .5s cubic-bezier(.2,.7,.2,1)', pointerEvents: expExpanded ? 'auto' : 'none' }}>
                        <ul ref={(el) => { bulletRefs.current[i] = el; }} style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {item.points.map((pt, j) => (
                            <li key={j} style={{ display: 'flex', gap: 10, alignItems: 'baseline', opacity: expExpanded ? 1 : 0, transform: expExpanded ? 'translateX(0)' : 'translateX(16px)', transition: 'opacity .4s ease, transform .5s cubic-bezier(.2,.7,.2,1)', transitionDelay: expExpanded ? `${(0.12 + i * 0.04 + j * 0.07).toFixed(2)}s` : '0s' }}>
                              <span style={{ flex: '0 0 auto', color: 'var(--accent)', fontSize: 9.9 }}>—</span>
                              <span style={{ fontSize: EXP.detailSize, lineHeight: 1.6, color: 'var(--fg2)' }}>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* NARROW — stacked accordion */}
            {expNarrow && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {C.experience.map((item, i) => {
                  const title = item.title.split(' · ').join('\n· ');
                  const titleSize = item.child ? Math.max(13, EXP.titleSize - 1.5) : EXP.titleSize;
                  return (
                    <div key={i} onClick={() => setExpOpenIdx((p) => (p === i ? null : i))} style={{ padding: `20px 0 20px ${item.child ? 26 : 0}px`, borderTop: item.child ? '1px solid transparent' : '1px solid var(--border)', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {item.child && <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1 }}>↳</span>}
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.2, letterSpacing: '.04em', color: 'var(--accent)' }}>{item.year}</div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: titleSize, fontWeight: 600, lineHeight: 1.25, color: 'var(--fg)', marginTop: 6, whiteSpace: 'pre-line' }}>{title}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, lineHeight: 1.45, color: 'var(--fg2)', marginTop: 8 }}>{item.detailTitle}</div>
                      <div style={{ overflow: 'hidden', maxHeight: expOpenIdx === i ? 800 : 0, opacity: expOpenIdx === i ? 1 : 0, transition: 'max-height .55s cubic-bezier(.2,.7,.2,1), opacity .4s ease' }}>
                        <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {item.points.map((pt, j) => (
                            <li key={j} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                              <span style={{ flex: '0 0 auto', color: 'var(--accent)', fontSize: 9.9 }}>—</span>
                              <span style={{ fontSize: EXP.detailSize, lineHeight: 1.6, color: 'var(--fg2)' }}>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!expNarrow && (
              <div onClick={toggleExp} style={{ marginTop: 36, display: 'inline-flex', alignItems: 'center', gap: 10, color: 'var(--fg3)', fontFamily: 'var(--font-mono)', fontSize: 9.9, letterSpacing: '.14em', cursor: 'pointer' }}>
                <span style={{ display: 'block', width: 28, height: 1, background: 'linear-gradient(90deg, var(--fg3), transparent)' }} />
                {expHint}
              </div>
            )}
          </div>
        </section>

        {/* 04 LIFE */}
        <section id="life" style={sectionStyle}>
          <div style={{ maxWidth: 840, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 14 }}>
              <span style={{ ...MONO_LABEL, color: 'var(--fg2)' }}>— 04 / Life</span>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: 'var(--fg2)', margin: '0 0 40px' }}>{C.lifeIntro}</p>
            <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {C.life.map((c, i) => {
                const id = LIFE_IDS[i];
                const on = hovered === id;
                const flip = flipped === id;
                const cols = lifeCols || 3;
                const n = C.life.length;
                const col = i % cols;
                const row = Math.floor(i / cols);
                const maxRow = Math.floor((n - 1) / cols);
                const tx = cols > 1 ? col / (cols - 1) : 0.5;
                const ty = maxRow > 0 ? row / maxRow : 0.5;
                const pct = (v: number) => `${Math.round(v * 100)}%`;
                const ox = pct(0.5 - CENTER_PULL + tx * (2 * CENTER_PULL));
                const oy = pct(0.5 - CENTER_PULL + ty * (2 * CENTER_PULL));
                const fs = cols >= 3 ? FLIP_SCALE : cols === 2 ? Math.min(FLIP_SCALE, 1.55) : Math.min(FLIP_SCALE, 1.06);
                const faceBase: CSSProperties = {
                  position: 'absolute',
                  inset: 0,
                  boxSizing: 'border-box',
                  borderRadius: 14,
                  background: 'var(--card-bg)',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  display: 'flex',
                  flexDirection: 'column',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                };
                /* the last Life slot is the bright soft-orange "visit my sandbox!" invite → the sandbox playground */
                if (id === 'tbd') {
                  return (
                    <a
                      key={id}
                      href="https://dohyun-jose-kim.github.io/sandbox/"
                      onMouseEnter={() => setHovered(id)}
                      onMouseLeave={() => setHovered(null)}
                      aria-label="Visit my sandbox — web experiments playground"
                      style={{
                        position: 'relative', height: 200, borderRadius: 14, overflow: 'hidden',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 9,
                        textDecoration: 'none', cursor: 'pointer',
                        background: 'linear-gradient(150deg, #ffd0a0 0%, #ffa869 52%, #ff9551 100%)',
                        boxShadow: on
                          ? '0 16px 38px rgba(255,142,74,.42), inset 0 0 0 1px rgba(255,255,255,.5)'
                          : '0 9px 24px rgba(255,142,74,.24), inset 0 0 0 1px rgba(255,255,255,.32)',
                        transform: on ? 'translateY(-4px)' : 'none',
                        transition: 'transform .45s cubic-bezier(.2,.7,.2,1), box-shadow .45s',
                      }}
                    >
                      <span aria-hidden style={{ position: 'absolute', top: -34, right: -24, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.6), rgba(255,255,255,0) 70%)', pointerEvents: 'none' }} />
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20.5, color: '#5a2a10', letterSpacing: '.005em' }}>visit my sandbox!</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(90,42,16,.66)' }}>web experiments&nbsp;↗</span>
                    </a>
                  );
                }
                return (
                  <div
                    key={id}
                    role="button"
                    tabIndex={0}
                    onMouseEnter={() => setHovered(id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => toggleFlip(id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleFlip(id);
                      }
                    }}
                    style={{
                      position: 'relative',
                      height: 200,
                      cursor: 'pointer',
                      perspective: 1100,
                      zIndex: flip ? 5 : 'auto',
                      transform: flip ? `scale(${fs})` : 'scale(1)',
                      transformOrigin: `${ox} ${oy}`,
                      transition: 'transform .5s cubic-bezier(.2,.7,.2,1)',
                    }}
                  >
                    <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform .7s cubic-bezier(.2,.7,.2,1)', transform: `rotateY(${flip ? 180 : 0}deg)` }}>
                      {/* FRONT */}
                      <div style={{ ...faceBase, padding: 24, border: `1px solid ${on ? 'var(--accent)' : 'var(--card-border)'}` }}>
                        <span aria-hidden style={{ position: 'absolute', top: 18, right: 18, fontFamily: 'var(--font-mono)', fontSize: 13.5, color: on ? 'var(--accent)' : 'var(--fg3)', transition: 'color .4s' }}>↻</span>
                        <div style={{ height: 44, display: 'flex', alignItems: 'center' }}>
                          <Motif id={id} on={on} />
                        </div>
                        <div style={{ marginTop: 'auto' }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17.1, color: 'var(--fg)' }}>{c.title}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--accent)', marginTop: 5 }}>{c.micro}</div>
                          <div style={{ fontSize: 11.7, lineHeight: 1.6, color: 'var(--fg3)', marginTop: 10 }}>{c.desc}</div>
                        </div>
                      </div>
                      {/* BACK — title top · photo slot middle · detail bottom */}
                      <div style={{ ...faceBase, padding: 18, border: '1px solid var(--accent)', justifyContent: 'space-between', transform: 'rotateY(180deg)' }}>
                        <div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 4 }}>{c.micro}</div>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, lineHeight: 1.2, color: 'var(--fg)' }}>{c.title}</div>
                        </div>
                        {/* photo placeholder — swap for a real <img> or drag-drop slot */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{ height: 54, margin: '5px 0', borderRadius: 9, border: '1px dashed var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.14em', color: 'var(--fg3)' }}
                        >
                          ＋ PHOTO
                        </div>
                        <div style={{ fontSize: 9.5, lineHeight: 1.45, color: 'var(--fg2)' }}>{c.detail}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 36, display: 'inline-flex', alignItems: 'center', gap: 10, color: 'var(--fg3)', fontFamily: 'var(--font-mono)', fontSize: 9.9, letterSpacing: '.14em' }}>
              <span style={{ display: 'block', width: 28, height: 1, background: 'linear-gradient(90deg, var(--fg3), transparent)' }} />
              CLICK TO EXPAND
            </div>
          </div>
        </section>

        {/* 05 CONTACT */}
        <section id="contact" style={sectionStyle}>
          <div style={{ maxWidth: 760, width: '100%' }}>
            <div style={{ ...MONO_LABEL, color: 'var(--fg2)', marginBottom: 32 }}>— 05 / Contact</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(21.6px,3.2vw,32.4px)', fontWeight: 400, lineHeight: 1.3, margin: 0, color: 'var(--fg)', whiteSpace: 'pre-line' }}>{C.contactHeadline}</h2>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(15.3px,2vw,18px)', lineHeight: 1.6, color: 'var(--fg2)', margin: '24px 0 0', maxWidth: 560, whiteSpace: 'pre-line' }}>{C.contactInvite}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '36px 0 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {C.contactBullets.map((b, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                  <span style={{ flex: '0 0 auto', color: 'var(--fg2)', fontFamily: 'var(--font-mono)', fontSize: 11.7, lineHeight: 1.5 }}>—</span>
                  <span style={{ color: 'var(--fg2)', fontSize: 13.5, lineHeight: 1.5 }}>{b}</span>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 40 }}>
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: 11.7, letterSpacing: '.04em', color: 'var(--fg)', padding: '12px 20px', border: '1px solid var(--border-strong)', borderRadius: 999, transition: 'border-color .35s, color .35s' }}
                >
                  {s.label} <span style={{ opacity: 0.5 }}>↗</span>
                </a>
              ))}
            </div>
            <div style={{ marginTop: 22, fontFamily: 'var(--font-mono)', fontSize: 11.7, letterSpacing: '.04em' }}>
              <a href="mailto:kimdohyun7942@khu.ac.kr" style={{ color: 'var(--fg2)', textDecoration: 'none', borderBottom: '1px solid var(--border-strong)', paddingBottom: 2 }}>kimdohyun7942@khu.ac.kr</a>
            </div>
            <div style={{ marginTop: 18, fontFamily: 'var(--font-mono)', fontSize: 9.9, color: 'var(--fg3)' }}>{C.contactNote}</div>
          </div>
        </section>
      </main>
    </div>
  );
}
