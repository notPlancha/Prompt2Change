# Prompt2Change 🪄

> An open-source, BYOK (Bring Your Own Key) Firefox extension to restyle and remix any website using natural language AI prompts.

Inspired by [ClickRemix](https://www.clickremix.com/) and rebuilt from the ground up for **Firefox Manifest V3**, powered by **Bun**, **Svelte 5** (Runes), and **UnoCSS** in attributify mode.

---

## ✨ Features

- **Natural Language Website Restyling**: Type requests like *"Make this page high-contrast OLED dark"*, *"Hide all sticky banners and video feeds"*, or *"Center the main article text with 1.8 line height"*.
- **BYOK (Bring Your Own Key)**: Use your own [OpenRouter](https://openrouter.ai/) API key, OpenAI key, or local OpenAI-compatible endpoints (e.g. Ollama). You only pay your model provider for generation calls.
- **Visual Element Picker**: Click the target crosshair (`⌖`) to hover over and visually select specific DOM elements on any webpage to focus your changes.
- **One-Click Presets & Template Library**:
  - 🌙 **True OLED Dark Mode** — Deep black backgrounds with warm contrast and muted images.
  - 📖 **Clean Reader View** — Optimal column width (740px), readable typography, hidden sidebars.
  - 🛡️ **Distraction Killer** — Strips cookie popups, sticky headers, promo banners, and newsletter modals.
  - 🗜️ **Compact Density** — Squeezes margins and padding for maximum screen real estate.
  - ☀️ **High Contrast Mode** — Distinct outlines and vivid typography for enhanced accessibility.
- **Refine Existing Styles**: Select any saved style and give follow-up instructions (e.g. *"increase button sizes too"*) to iteratively tweak styles without starting from scratch.
- **Live Code Editor**: Manually inspect and edit generated CSS and JavaScript directly inside a tabbed editor modal with live re-application.
- **Per-Site Persistence**: All remixes are saved locally per hostname and re-applied automatically whenever you revisit the site.
- **Firefox MV3 Optimized**: Implements isolated-world DOM execution and DeclarativeNetRequest CSP modification to bypass restrictive Content Security Policies safely.
- **Usage Tracking**: Displays monthly API calls in the popup footer.

---

## 🛠️ Tech Stack

- **Runtime & Package Manager**: [Bun](https://bun.sh/)
- **Extension Framework**: [WXT](https://wxt.dev/) with Firefox MV3 configuration
- **UI Framework**: [Svelte 5](https://svelte.dev/) with Runes (`$state`, `$derived`, `$props`, `$effect`)
- **Styling**: [UnoCSS](https://unocss.dev/) with Attributify Mode, Preset Uno, and Lucide Icons

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.1+)
- Firefox Browser (v109+)
- An [OpenRouter API Key](https://openrouter.ai/keys) (or OpenAI-compatible key)

### Installation

```bash
# Clone the repository
git clone https://github.com/notPlancha/Prompt2Change.git
cd Prompt2Change

# Install dependencies with Bun
bun install
```

### Development Mode

Run live development with automatic hot-reloading:

```bash
bun run dev
```

This launches a Firefox instance with the extension loaded and watches for changes.

### Production Build

Compile the extension for Firefox:

```bash
bun run build
```

The output bundle is generated in `dist/firefox-mv3/`.

To package the extension into a zip archive ready for distribution:

```bash
bun run zip
```

Archives will be created at:
- `dist/prompt2change-1.0.0-firefox.zip`
- `dist/prompt2change-1.0.0-sources.zip`

---

## 🦊 How to Load in Firefox

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2. Click **"Load Temporary Add-on..."**.
3. Select `dist/firefox-mv3/manifest.json` (or the zip file).
4. The **Prompt2Change** icon will appear in your Firefox toolbar.
5. Click the extension icon, click the **Settings** (⚙️) gear, enter your OpenRouter API key, and click **Save Settings**.

---

## 📐 Project Structure

```
Prompt2Change/
├── public/                 # Static extension assets
│   ├── icons/              # Extension icons (16, 32, 48, 128)
│   └── rules.json          # DeclarativeNetRequest CSP rules
├── src/
│   ├── entrypoints/
│   │   ├── background.ts   # MV3 background script & AI message handler
│   │   ├── content.ts      # Content script, style injection & element picker
│   │   └── popup/          # Svelte 5 popup application
│   │       ├── App.svelte
│   │       ├── Header.svelte
│   │       ├── PromptArea.svelte
│   │       ├── StyleCard.svelte
│   │       ├── TemplateCatalog.svelte
│   │       ├── CodeEditorModal.svelte
│   │       ├── SettingsModal.svelte
│   │       ├── Footer.svelte
│   │       ├── main.ts
│   │       └── index.html
│   └── utils/
│       ├── ai.ts           # Prompt builder & OpenRouter/OpenAI API integration
│       ├── storage.ts      # WebExtension local storage manager
│       ├── templates.ts    # Built-in one-click preset library
│       └── types.ts        # TypeScript data contracts
├── package.json
├── tsconfig.json
├── uno.config.ts           # UnoCSS configuration (Attributify + Icons)
└── wxt.config.ts           # WXT Firefox extension configuration
```

---

## 🔒 Privacy & Security

- **No Remote Telemetry**: Prompt2Change has zero analytics, tracking, or intermediary backend servers.
- **Local Storage**: Your API key and website customizations are stored exclusively inside your browser's private extension storage.
- **Direct AI Calls**: Network requests are sent directly from your browser to your designated AI endpoint (OpenRouter or your custom URL).

---

## 📜 Credits & Acknowledgments

- Inspired by [ClickRemix](https://www.clickremix.com/) and [alentodorov/clickremix-byok](https://github.com/alentodorov/clickremix-byok) by Alen Todorov.
- Built for the open-source community under the MIT License.
