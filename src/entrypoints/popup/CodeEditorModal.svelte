<script lang="ts">
  import type { RemixStyle } from '../../utils/types';

  interface Props {
    style: RemixStyle;
    onSave: (updated: RemixStyle) => void;
    onClose: () => void;
  }

  let { style, onSave, onClose }: Props = $props();

  let activeTab = $state<'css' | 'js'>('css');
  let title = $state('');
  let css = $state('');
  let js = $state('');

  $effect(() => {
    title = style.title;
    css = style.css || '';
    js = style.js || '';
  });

  function handleSave() {
    onSave({
      ...style,
      title: title.trim() || style.title,
      css,
      js,
      updatedAt: Date.now(),
    });
  }
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm"
>
  <div
    class="w-full max-w-[400px] h-[420px] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden"
  >
    <!-- Modal Header -->
    <div class="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800 bg-slate-950/50">
      <div flex items-center gap-2 flex-1 min-w-0 mr-2>
        <span class="i-lucide-code-2 text-indigo-400 text-sm"></span>
        <input
          type="text"
          bind:value={title}
          class="bg-transparent text-xs font-semibold text-slate-100 border-none outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 w-full"
          placeholder="Style Title"
        />
      </div>

      <button
        type="button"
        onclick={onClose}
        aria-label="Close editor"
        class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
      >
        <span class="i-lucide-x text-sm"></span>
      </button>
    </div>

    <!-- Tab bar -->
    <div class="flex items-center justify-between px-3 py-1.5 border-b border-slate-800 bg-slate-950/30">
      <div flex items-center gap-1>
        <button
          type="button"
          onclick={() => (activeTab = 'css')}
          class="px-2.5 py-1 text-xs font-medium rounded-lg transition-colors {activeTab === 'css' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}"
        >
          CSS
        </button>
        <button
          type="button"
          onclick={() => (activeTab = 'js')}
          class="px-2.5 py-1 text-xs font-medium rounded-lg transition-colors {activeTab === 'js' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}"
        >
          JavaScript
        </button>
      </div>

      <span class="text-[10px] text-slate-500 font-mono">
        {activeTab === 'css' ? `${css.split('\n').length} lines` : `${js.split('\n').length} lines`}
      </span>
    </div>

    <!-- Code Editor Body -->
    <div class="flex-1 relative bg-slate-950 p-2 overflow-hidden">
      {#if activeTab === 'css'}
        <textarea
          bind:value={css}
          spellcheck="false"
          placeholder={"/* Custom CSS rules */\nbody { background: #121212 !important; }"}
          class="w-full h-full font-mono text-xs leading-relaxed text-indigo-200 bg-transparent resize-none border-none outline-none p-1 overflow-auto"
        ></textarea>
      {:else}
        <textarea
          bind:value={js}
          spellcheck="false"
          placeholder={"// Custom JavaScript executed safely in page context\nconsole.log('Prompt2Change active');"}
          class="w-full h-full font-mono text-xs leading-relaxed text-amber-200 bg-transparent resize-none border-none outline-none p-1 overflow-auto"
        ></textarea>
      {/if}
    </div>

    <!-- Modal Footer -->
    <div class="flex items-center justify-between px-3.5 py-2.5 border-t border-slate-800 bg-slate-950/60">
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
        class="px-3.5 py-1.5 text-xs font-medium rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
      >
        Save & Apply
      </button>
    </div>
  </div>
</div>
