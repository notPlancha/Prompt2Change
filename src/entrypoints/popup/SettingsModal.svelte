<script lang="ts">
  import { POPULAR_MODELS } from '../../utils/ai';
  import type { SiteSettings } from '../../utils/types';

  interface Props {
    settings: SiteSettings;
    onSave: (newSettings: SiteSettings) => Promise<void>;
    onClose: () => void;
  }

  let { settings, onSave, onClose }: Props = $props();

  let apiKey = $state('');
  let model = $state('openai/gpt-5.1-codex-mini');
  let customModel = $state('');
  let endpoint = $state('https://openrouter.ai/api/v1/chat/completions');
  let allowJs = $state(true);

  $effect(() => {
    apiKey = settings.apiKey || '';
    model = settings.model || 'openai/gpt-5.1-codex-mini';
    endpoint = settings.endpoint || 'https://openrouter.ai/api/v1/chat/completions';
    allowJs = settings.allowJs ?? true;
  });

  let showKey = $state(false);
  let testStatus = $state<{ type: 'idle' | 'testing' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  const isPresetModel = $derived(POPULAR_MODELS.some((m) => m.id === model));

  async function handleTestConnection() {
    if (!apiKey.trim()) {
      testStatus = { type: 'error', message: 'Enter an API key first' };
      return;
    }

    testStatus = { type: 'testing', message: 'Testing API connection...' };
    try {
      const activeModel = model === 'custom' ? customModel.trim() : model;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: activeModel || 'openai/gpt-5.1-codex-mini',
          messages: [{ role: 'user', content: 'Say "OK"' }],
          max_tokens: 5,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        let msg = `HTTP ${res.status}`;
        try {
          const json = JSON.parse(errText);
          if (json.error?.message) msg = json.error.message;
        } catch {
          if (errText) msg = errText.slice(0, 100);
        }
        testStatus = { type: 'error', message: `Failed: ${msg}` };
        return;
      }

      testStatus = { type: 'success', message: 'Connection successful!' };
    } catch (err: any) {
      testStatus = { type: 'error', message: `Network error: ${err.message}` };
    }
  }

  async function handleSave() {
    const finalModel = model === 'custom' ? (customModel.trim() || 'openai/gpt-5.1-codex-mini') : model;
    await onSave({
      apiKey: apiKey.trim(),
      model: finalModel,
      endpoint: endpoint.trim() || 'https://openrouter.ai/api/v1/chat/completions',
      autoApply: settings.autoApply,
      allowJs,
    });
    onClose();
  }
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm"
>
  <div
    class="w-full max-w-[410px] max-h-[450px] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden"
  >
    <!-- Modal Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
      <div flex items-center gap-2>
        <span class="i-lucide-settings text-indigo-400 text-base"></span>
        <h3 class="font-semibold text-xs text-slate-100">Settings & API Configuration</h3>
      </div>
      <button
        type="button"
        onclick={onClose}
        aria-label="Close settings"
        class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
      >
        <span class="i-lucide-x text-sm"></span>
      </button>
    </div>

    <!-- Modal Content -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
      <!-- API Key Input -->
      <div space-y-1.5>
        <div flex items-center justify-between>
          <label for="apikey" class="font-medium text-slate-300">OpenRouter API Key (BYOK)</label>
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5"
          >
            <span>Get API Key</span>
            <span class="i-lucide-external-link text-[10px]"></span>
          </a>
        </div>
        <div relative>
          <input
            id="apikey"
            type={showKey ? 'text' : 'password'}
            bind:value={apiKey}
            placeholder="sk-or-v1-..."
            class="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-3 py-2 pr-10 text-xs text-slate-100 font-mono outline-none"
          />
          <button
            type="button"
            onclick={() => (showKey = !showKey)}
            class="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
            title={showKey ? 'Hide key' : 'Show key'}
          >
            <span class={showKey ? 'i-lucide-eye-off' : 'i-lucide-eye'}></span>
          </button>
        </div>
        <p class="text-[10px] text-slate-400 leading-normal">
          Your key is saved locally in Firefox storage and only used to contact AI providers directly.
        </p>
      </div>

      <!-- Model Picker -->
      <div space-y-1.5>
        <label for="model-select" class="font-medium text-slate-300">AI Model</label>
        <select
          id="model-select"
          bind:value={model}
          class="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
        >
          {#each POPULAR_MODELS as m}
            <option value={m.id}>{m.name}</option>
          {/each}
        </select>

        {#if model === 'custom' || !isPresetModel}
          <div pt-1>
            <input
              type="text"
              bind:value={customModel}
              placeholder="e.g. meta-llama/llama-3.3-70b-instruct"
              class="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono outline-none"
            />
          </div>
        {/if}
      </div>

      <!-- Endpoint URL -->
      <div space-y-1.5>
        <label for="endpoint-input" class="font-medium text-slate-300">API Endpoint</label>
        <input
          id="endpoint-input"
          type="text"
          bind:value={endpoint}
          placeholder="https://openrouter.ai/api/v1/chat/completions"
          class="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none"
        />
        <p class="text-[10px] text-slate-400">
          Compatible with OpenRouter, OpenAI, and local Ollama (OpenAI mode).
        </p>
      </div>

      <!-- Test Connection & Status -->
      <div class="pt-1 flex items-center justify-between">
        <button
          type="button"
          onclick={handleTestConnection}
          disabled={testStatus.type === 'testing'}
          class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
        >
          {#if testStatus.type === 'testing'}
            <span class="i-lucide-loader-2 animate-spin text-xs"></span>
          {:else}
            <span class="i-lucide-activity text-xs text-indigo-400"></span>
          {/if}
          <span>Test Connection</span>
        </button>

        {#if testStatus.message}
          <span
            class="text-[11px] font-medium truncate max-w-[220px] {testStatus.type === 'success' ? 'text-emerald-400' : testStatus.type === 'error' ? 'text-rose-400' : 'text-slate-400'}"
          >
            {testStatus.message}
          </span>
        {/if}
      </div>
    </div>

    <!-- Modal Footer -->
    <div class="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-800 bg-slate-950/60">
      <button
        type="button"
        onclick={onClose}
        class="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg"
      >
        Cancel
      </button>

      <button
        type="button"
        onclick={handleSave}
        class="px-4 py-1.5 text-xs font-medium rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
      >
        Save Settings
      </button>
    </div>
  </div>
</div>
