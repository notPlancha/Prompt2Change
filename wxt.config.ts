import { defineConfig } from 'wxt';
import UnoCSS from 'unocss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  outDir: 'dist',
  manifestVersion: 3,
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    name: 'Prompt2Change',
    description: 'Restyle and remix any website with AI prompts using your own API key (BYOK).',
    version: '1.0.0',
    browser_specific_settings: {
      gecko: {
        id: 'prompt2change@firefox.addon',
        strict_min_version: '109.0',
      },
    },
    permissions: ['activeTab', 'scripting', 'storage', 'declarativeNetRequest'],
    host_permissions: ['<all_urls>'],
    declarative_net_request: {
      rule_resources: [
        {
          id: 'ruleset_1',
          enabled: true,
          path: 'rules.json',
        },
      ],
    },
    icons: {
      16: 'icons/icon-16.png',
      32: 'icons/icon-32.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png',
    },
  },
  vite: () => ({
    plugins: [UnoCSS()],
  }),
});
