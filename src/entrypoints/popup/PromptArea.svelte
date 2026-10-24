<script lang="ts">
  import type { TargetElementInfo, RemixStyle } from '../../utils/types';

  interface Props {
    instruction: string;
    isBusy: boolean;
    statusText: string;
    targetElement: TargetElementInfo | null;
    refiningStyle: RemixStyle | null;
    onApply: () => void;
    onStartPicker: () => void;
    onClearTarget: () => void;
    onCancelRefine: () => void;
  }

  let {
    instruction = $bindable(''),
    isBusy,
    statusText,
    targetElement,
    refiningStyle,
    onApply,
    onStartPicker,
    onClearTarget,
    onCancelRefine,
  }: Props = $props();

  function handleKeyDown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isBusy && instruction.trim()) {
        onApply();
      }
    }
  }
</script>

<div class="px-4 pt-3 pb-2 space-y-2">
  {#if refiningStyle}
    <div
      class="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-950/40 border border-amber-600/40 text-amber-300 text-xs"
    >
      <div flex items-center gap-1.5 truncate>
        <span class="i-lucide-wrench text-xs"></span>
        <span font-medium>Refining:</span>
        <span truncate text-amber-200>"{refiningStyle.title}"</span>
      </div>
      <button
        type="button"
        onclick={onCancelRefine}
        class="hover:text-white p-0.5"
        title="Cancel refinement"
      >
        <span class="i-lucide-x text-xs"></span>
      </button>
    </div>
  {/if}

  {#if targetElement}
    <div
      class="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs"
    >
      <div flex items-center gap-1.5 truncate>
        <span class="i-lucide-crosshair text-xs"></span>
        <span font-medium>Target:</span>
        <span class="truncate text-cyan-200 font-mono text-[11px]">
          {targetElement.descriptor}
        </span>
      </div>
      <button
        type="button"
        onclick={onClearTarget}
        class="hover:text-white p-0.5"
        title="Clear target element"
      >
        <span class="i-lucide-x text-xs"></span>
      </button>
    </div>
  {/if}

  <div relative>
    <textarea
      bind:value={instruction}
      onkeydown={handleKeyDown}
      disabled={isBusy}
      placeholder={refiningStyle
        ? 'How should the AI refine this style? (e.g. "make text larger", "exclude images")'
        : 'Describe the changes you want, or click the target icon to select an element...'}
      rows="3"
      class="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 pr-10 text-xs text-slate-100 placeholder-slate-500 resize-none outline-none transition-all duration-150"
    ></textarea>

    <button
      type="button"
      title="Select specific element on page"
      onclick={onStartPicker}
      disabled={isBusy}
      class="absolute right-2.5 top-2.5 p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors disabled:opacity-40"
    >
      <span class="i-lucide-crosshair text-base"></span>
    </button>
  </div>

  <div flex items-center justify-between pt-0.5>
    <div class="text-[11px] text-slate-500 flex items-center gap-1">
      <kbd class="font-sans bg-slate-800 border border-slate-700 px-1 py-0.5 rounded text-[10px]">Ctrl</kbd>
      <span>+</span>
      <kbd class="font-sans bg-slate-800 border border-slate-700 px-1 py-0.5 rounded text-[10px]">Enter</kbd>
    </div>

    <button
      type="button"
      onclick={onApply}
      disabled={isBusy || !instruction.trim()}
      class="px-3.5 py-1.5 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-md shadow-indigo-600/25 active:scale-98"
    >
      {#if isBusy}
        <span class="i-lucide-loader-2 animate-spin text-xs"></span>
        <span>{statusText || 'Remixing...'}</span>
      {:else}
        <span class="i-lucide-wand-2 text-xs"></span>
        <span>{refiningStyle ? 'Update Style' : 'Apply Remix'}</span>
      {/if}
    </button>
  </div>
</div>
