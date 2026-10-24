<script lang="ts">
  import type { RemixStyle } from '../../utils/types';

  interface Props {
    style: RemixStyle;
    onToggle: (id: string) => void;
    onRefine: (style: RemixStyle) => void;
    onEditCode: (style: RemixStyle) => void;
    onDelete: (id: string) => void;
  }

  let { style, onToggle, onRefine, onEditCode, onDelete }: Props = $props();
</script>

<div
  class="rounded-xl border p-3 transition-all duration-150 {style.enabled ? 'bg-slate-900/80 border-slate-700/80 shadow-sm' : 'bg-slate-950/40 border-slate-800/60 opacity-65'}"
>
  <div flex items-start justify-between gap-2>
    <div class="flex-1 min-w-0">
      <div flex items-center gap-2 mb-1>
        <span
          class="font-semibold text-xs truncate {style.enabled ? 'text-slate-100' : 'text-slate-400'}"
        >
          {style.title}
        </span>
        {#if style.js && style.js.trim()}
          <span
            class="text-[9px] px-1 py-0.5 rounded bg-amber-950/50 text-amber-400 border border-amber-800/50 font-mono"
          >
            JS
          </span>
        {/if}
      </div>

      <p class="text-[11px] text-slate-400 truncate" title={style.instruction}>
        {style.instruction}
      </p>
    </div>

    <!-- Toggle Switch -->
    <button
      type="button"
      role="switch"
      aria-checked={style.enabled}
      title={style.enabled ? 'Disable style' : 'Enable style'}
      onclick={() => onToggle(style.id)}
      class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none {style.enabled ? 'bg-indigo-600' : 'bg-slate-700'}"
    >
      <span
        aria-hidden="true"
        class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {style.enabled ? 'translate-x-4' : 'translate-x-0'}"
      ></span>
    </button>
  </div>

  <div class="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-800/70">
    <div class="text-[10px] text-slate-500 font-mono">
      {style.css ? `${style.css.split('\n').length} lines CSS` : '0 CSS'}
    </div>

    <div flex items-center gap-1>
      <button
        type="button"
        title="Refine style with AI prompt"
        onclick={() => onRefine(style)}
        class="px-2 py-1 text-[10px] font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/70 flex items-center gap-1 transition-colors"
      >
        <span class="i-lucide-sparkles text-[10px] text-indigo-400"></span>
        <span>Refine</span>
      </button>

      <button
        type="button"
        title="Edit CSS & JS directly"
        onclick={() => onEditCode(style)}
        class="px-2 py-1 text-[10px] font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/70 flex items-center gap-1 transition-colors"
      >
        <span class="i-lucide-code-2 text-[10px]"></span>
        <span>Code</span>
      </button>

      <button
        type="button"
        title="Delete this remix"
        onclick={() => onDelete(style.id)}
        class="p-1 text-[10px] rounded-md hover:bg-red-950/50 text-slate-500 hover:text-red-400 transition-colors"
      >
        <span class="i-lucide-trash-2 text-xs"></span>
      </button>
    </div>
  </div>
</div>
