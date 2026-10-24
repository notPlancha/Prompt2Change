<script lang="ts">
  import { onMount } from 'svelte';
  import Header from './Header.svelte';
  import PromptArea from './PromptArea.svelte';
  import TemplateCatalog from './TemplateCatalog.svelte';
  import StyleCard from './StyleCard.svelte';
  import CodeEditorModal from './CodeEditorModal.svelte';
  import SettingsModal from './SettingsModal.svelte';
  import Footer from './Footer.svelte';

  import type { RemixStyle, SiteSettings, TargetElementInfo, TemplatePreset } from '../../utils/types';
  import {
    getSiteStyles,
    saveSiteStyles,
    resetSiteStyles,
    getSettings,
    saveSettings,
    getUsageStats,
    getTargetSelection,
    setTargetSelection,
  } from '../../utils/storage';

  let hostname = $state('');
  let activeTabId = $state<number | null>(null);
  let styles = $state<RemixStyle[]>([]);
  let instruction = $state('');
  let isBusy = $state(false);
  let statusText = $state('');
  let errorMessage = $state('');

  let targetElement = $state<TargetElementInfo | null>(null);
  let refiningStyle = $state<RemixStyle | null>(null);
  let editingStyle = $state<RemixStyle | null>(null);

  let showSettings = $state(false);
  let showTemplates = $state(false);
  let settings = $state<SiteSettings>({
    apiKey: '',
    model: 'openai/gpt-5.1-codex-mini',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    autoApply: true,
    allowJs: true,
  });
  let usageCount = $state(0);

  const activeCount = $derived(styles.filter((s) => s.enabled).length);

  onMount(async () => {
    try {
      settings = await getSettings();
      const stats = await getUsageStats();
      usageCount = stats.count;

      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];

      if (currentTab?.id && currentTab.url) {
        activeTabId = currentTab.id;
        try {
          const url = new URL(currentTab.url);
          if (url.protocol.startsWith('http')) {
            hostname = url.hostname;
            styles = await getSiteStyles(hostname);

            // Check if there was a picked element waiting in storage
            const picked = await getTargetSelection(currentTab.id);
            if (picked) {
              targetElement = picked;
            }
          } else {
            hostname = 'Browser internal page';
          }
        } catch {
          hostname = '';
        }
      }
    } catch (err) {
      console.error('Failed to init popup:', err);
    }
  });

  async function notifyTabAndBadge(updatedStyles: RemixStyle[]) {
    if (!activeTabId) return;
    try {
      await browser.tabs.sendMessage(activeTabId, {
        type: 'APPLY_STYLES',
        styles: updatedStyles,
      });
      await browser.runtime.sendMessage({
        type: 'REFRESH_BADGE',
        tabId: activeTabId,
      });
    } catch {
      // Content script may not be loaded on restricted pages
    }
  }

  async function handleApply() {
    errorMessage = '';
    if (!instruction.trim()) return;

    if (!settings.apiKey) {
      showSettings = true;
      errorMessage = 'Please enter an OpenRouter API key to generate styles.';
      return;
    }

    if (!activeTabId || !hostname || hostname.includes('internal')) {
      errorMessage = 'Cannot apply styles on this page.';
      return;
    }

    isBusy = true;
    statusText = 'Analyzing page...';

    try {
      let pageSummary = {
        url: '',
        hostname,
        title: hostname,
        description: '',
        headings: [],
        mainTags: [],
      };

      try {
        const summaryRes = await browser.tabs.sendMessage(activeTabId, {
          type: 'GET_PAGE_SUMMARY',
        });
        if (summaryRes) pageSummary = summaryRes;
      } catch {
        // Fallback summary
      }

      statusText = 'Generating remix...';

      const response: any = await browser.runtime.sendMessage({
        type: 'CALL_AI_MODEL',
        instruction: instruction.trim(),
        pageSummary,
        targetSelection: targetElement,
        existingStyle: refiningStyle,
      });

      if (!response || !response.success) {
        errorMessage = response?.error || 'Failed to generate remix from AI.';
        isBusy = false;
        return;
      }

      const now = Date.now();
      let updatedStyles: RemixStyle[] = [];

      if (refiningStyle) {
        // Update existing style
        updatedStyles = styles.map((s) => {
          if (s.id === refiningStyle!.id) {
            return {
              ...s,
              title: response.summary || s.title,
              instruction: `${s.instruction} → ${instruction.trim()}`,
              css: response.css || s.css,
              js: response.js || s.js,
              updatedAt: now,
              enabled: true,
            };
          }
          return s;
        });
      } else {
        // Create new style
        const newStyle: RemixStyle = {
          id: `style_${now}_${Math.random().toString(36).slice(2, 7)}`,
          title: response.summary || instruction.trim().slice(0, 32),
          instruction: instruction.trim(),
          css: response.css || '',
          js: response.js || '',
          enabled: true,
          createdAt: now,
          updatedAt: now,
          targetSelector: targetElement?.selector,
        };
        updatedStyles = [newStyle, ...styles];
      }

      styles = updatedStyles;
      await saveSiteStyles(hostname, styles);
      await notifyTabAndBadge(styles);

      // Refresh usage counter
      const stats = await getUsageStats();
      usageCount = stats.count;

      // Reset prompt state
      instruction = '';
      refiningStyle = null;
      if (targetElement && activeTabId) {
        await setTargetSelection(activeTabId, null);
        targetElement = null;
      }
    } catch (err: any) {
      errorMessage = err.message || 'An unexpected error occurred.';
    } finally {
      isBusy = false;
      statusText = '';
    }
  }

  async function handleToggleStyle(id: string) {
    styles = styles.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    await saveSiteStyles(hostname, styles);
    await notifyTabAndBadge(styles);
  }

  async function handleDeleteStyle(id: string) {
    styles = styles.filter((s) => s.id !== id);
    await saveSiteStyles(hostname, styles);
    await notifyTabAndBadge(styles);
  }

  async function handleResetAll() {
    if (!hostname) return;
    styles = [];
    await resetSiteStyles(hostname);
    await notifyTabAndBadge([]);
  }

  async function handleSelectTemplate(template: TemplatePreset) {
    if (!hostname) return;
    const now = Date.now();
    const newStyle: RemixStyle = {
      id: `preset_${template.id}_${now}`,
      title: template.title,
      instruction: `Applied preset: ${template.title}`,
      css: template.css,
      js: template.js || '',
      enabled: true,
      createdAt: now,
      updatedAt: now,
    };

    styles = [newStyle, ...styles];
    await saveSiteStyles(hostname, styles);
    await notifyTabAndBadge(styles);
    showTemplates = false;
  }

  async function handleStartPicker() {
    if (!activeTabId) return;
    try {
      await browser.tabs.sendMessage(activeTabId, { type: 'START_PICKER' });
      // Close popup so user can easily interact with page
      window.close();
    } catch (err) {
      errorMessage = 'Could not activate element picker on this page.';
    }
  }

  async function handleClearTarget() {
    targetElement = null;
    if (activeTabId) {
      await setTargetSelection(activeTabId, null);
    }
  }

  async function handleSaveSettings(newSettings: SiteSettings) {
    settings = await saveSettings(newSettings);
    showSettings = false;
  }

  async function handleSaveEditedCode(updated: RemixStyle) {
    styles = styles.map((s) => (s.id === updated.id ? updated : s));
    await saveSiteStyles(hostname, styles);
    await notifyTabAndBadge(styles);
    editingStyle = null;
  }
</script>

<div class="flex flex-col min-h-[480px] bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
  <Header
    {hostname}
    {showTemplates}
    onToggleTemplates={() => (showTemplates = !showTemplates)}
    onReset={handleResetAll}
    onOpenSettings={() => (showSettings = true)}
  />

  {#if showTemplates}
    <TemplateCatalog onSelectTemplate={handleSelectTemplate} />
  {/if}

  {#if errorMessage}
    <div
      class="flex items-start justify-between gap-2 mx-4 my-2 p-2.5 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs"
    >
      <div flex items-center gap-1.5>
        <span class="i-lucide-alert-circle text-red-400 text-sm"></span>
        <span>{errorMessage}</span>
      </div>
      <button
        type="button"
        onclick={() => (errorMessage = '')}
        class="p-0.5 text-red-400 hover:text-white"
        aria-label="Dismiss error"
      >
        <span class="i-lucide-x text-xs"></span>
      </button>
    </div>
  {/if}

  <PromptArea
    bind:instruction
    {isBusy}
    {statusText}
    {targetElement}
    {refiningStyle}
    onApply={handleApply}
    onStartPicker={handleStartPicker}
    onClearTarget={handleClearTarget}
    onCancelRefine={() => (refiningStyle = null)}
  />

  <!-- Styles List -->
  <main class="flex-1 px-4 py-2 space-y-2.5 overflow-y-auto max-h-[260px]">
    <div class="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
      <span class="font-semibold text-slate-300">Styles on this site</span>
      <span>{styles.length} total</span>
    </div>

    {#if styles.length === 0}
      <div
        class="flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30"
      >
        <div
          class="w-10 h-10 rounded-xl mb-2 flex items-center justify-center bg-slate-800/80 text-slate-500"
        >
          <span class="i-lucide-layers text-xl"></span>
        </div>
        <p font-medium text-xs text-slate-300>No remixes yet</p>
        <p text="[11px]" text-slate-500 max-w-220px mt-0.5>
          Type a request above or select a preset to instantly customize this site.
        </p>
      </div>
    {:else}
      {#each styles as style (style.id)}
        <StyleCard
          {style}
          onToggle={handleToggleStyle}
          onRefine={(s) => {
            refiningStyle = s;
            instruction = '';
          }}
          onEditCode={(s) => (editingStyle = s)}
          onDelete={handleDeleteStyle}
        />
      {/each}
    {/if}
  </main>

  <Footer {usageCount} {activeCount} />

  {#if editingStyle}
    <CodeEditorModal
      style={editingStyle}
      onSave={handleSaveEditedCode}
      onClose={() => (editingStyle = null)}
    />
  {/if}

  {#if showSettings}
    <SettingsModal
      {settings}
      onSave={handleSaveSettings}
      onClose={() => (showSettings = false)}
    />
  {/if}
</div>
