<script lang="ts">
  import { TEMPLATE_PRESETS } from '../../utils/templates';
  import type { TemplatePreset } from '../../utils/types';

  interface Props {
    onSelectTemplate: (template: TemplatePreset) => void;
  }

  let { onSelectTemplate }: Props = $props();
</script>

<div class="px-4 py-2 border-b border-slate-800 bg-slate-950/40">
  <div flex items-center justify-between mb-2>
    <div flex items-center gap-1.5 text-xs font-semibold text-slate-300>
      <span class="i-lucide-sparkles text-indigo-400"></span>
      <span>Instant Presets</span>
    </div>
    <span class="text-[10px] text-slate-500">Click to apply instantly</span>
  </div>

  <div class="grid grid-cols-2 gap-2">
    {#each TEMPLATE_PRESETS as t}
      <button
        type="button"
        onclick={() => onSelectTemplate(t)}
        class="text-left p-2 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 transition-all duration-150 group"
      >
        <div flex items-center gap-1.5 mb-1>
          <span class={`${t.icon} text-indigo-400 text-xs`}></span>
          <span class="font-medium text-xs text-slate-200 group-hover:text-indigo-300 truncate">
            {t.title}
          </span>
        </div>
        <p class="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
          {t.description}
        </p>
      </button>
    {/each}
  </div>
</div>
