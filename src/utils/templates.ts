import type { TemplatePreset } from './types';

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'true-dark',
    title: 'True OLED Dark Mode',
    description: 'Deep black background with warm contrast and muted images.',
    icon: 'i-lucide-moon',
    css: `
html, body {
  background-color: #0b0f19 !important;
  color: #e2e8f0 !important;
}

header, nav, aside, section, article, div, main {
  background-color: inherit;
  border-color: #1e293b !important;
}

p, span, h1, h2, h3, h4, h5, h6, li, td, th {
  color: #e2e8f0 !important;
}

a {
  color: #38bdf8 !important;
}

input, textarea, select {
  background-color: #1e293b !important;
  color: #f8fafc !important;
  border: 1px solid #334155 !important;
}

img, video {
  filter: brightness(0.85) contrast(1.05);
  transition: filter 0.2s ease;
}

img:hover, video:hover {
  filter: brightness(1);
}
    `.trim(),
  },
  {
    id: 'clean-reader',
    title: 'Clean Reader View',
    description: 'Centers typography with pleasant line height and comfortable reading column.',
    icon: 'i-lucide-book-open',
    css: `
main, article, [role="main"], .content, .post, .article {
  max-width: 740px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  padding: 2.5rem 1.5rem !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Georgia, serif !important;
  font-size: 19px !important;
  line-height: 1.75 !important;
  color: #1f2937 !important;
}

p {
  margin-bottom: 1.5rem !important;
}

aside, [class*="sidebar"], [class*="related"], [id*="sidebar"] {
  display: none !important;
}
    `.trim(),
  },
  {
    id: 'distraction-killer',
    title: 'Distraction Killer',
    description: 'Hides sticky headers, cookie banners, floating share widgets, and promo boxes.',
    icon: 'i-lucide-shield-alert',
    css: `
/* Hide cookie and consent dialogs */
[class*="cookie"], [id*="cookie"], [class*="consent"], [id*="consent"],
[class*="banner-promo"], [class*="newsletter"], [id*="newsletter"],
[class*="overlay"]:not(dialog), [class*="modal-backdrop"],
[class*="floating-share"], [class*="social-bar"],
[aria-label*="cookie" i], [aria-label*="consent" i] {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

/* Unstick sticky floating headers taking up vertical space */
header, [class*="header"], [class*="sticky"], [class*="fixed"] {
  position: static !important;
}

body {
  overflow: auto !important;
}
    `.trim(),
  },
  {
    id: 'compact-dense',
    title: 'Compact Density',
    description: 'Compresses oversized padding, margins, and headers for maximum screen real estate.',
    icon: 'i-lucide-minimize-2',
    css: `
* {
  padding-top: max(0px, calc(padding-top * 0.5)) !important;
  padding-bottom: max(0px, calc(padding-bottom * 0.5)) !important;
}

h1 { font-size: 1.75rem !important; margin: 0.5rem 0 !important; }
h2 { font-size: 1.4rem !important; margin: 0.4rem 0 !important; }
h3 { font-size: 1.15rem !important; margin: 0.3rem 0 !important; }

p, li, td {
  line-height: 1.35 !important;
  margin-bottom: 0.4rem !important;
}

[class*="hero"], [id*="hero"] {
  padding: 1rem !important;
  min-height: auto !important;
}
    `.trim(),
  },
  {
    id: 'high-contrast',
    title: 'High Contrast Mode',
    description: 'Sharp, distinct borders and vivid foreground text for effortless readability.',
    icon: 'i-lucide-sun-medium',
    css: `
body, p, span, li, a, h1, h2, h3, h4 {
  font-weight: 500 !important;
  letter-spacing: 0.01em !important;
  text-rendering: optimizeLegibility !important;
  -webkit-font-smoothing: antialiased !important;
}

a {
  text-decoration: underline !important;
  text-underline-offset: 3px !important;
}

button, input, select {
  outline: 2px solid #000 !important;
}
    `.trim(),
  },
];
