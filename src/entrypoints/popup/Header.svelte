<script lang="ts">
  interface Props {
    hostname: string;
    showTemplates: boolean;
    onToggleTemplates: () => void;
    onReset: () => void;
    onOpenSettings: () => void;
  }

  let {
    hostname,
    showTemplates,
    onToggleTemplates,
    onReset,
    onOpenSettings,
  }: Props = $props();
</script>

<header class="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-10">
  <div flex items-center gap-2.5>
    <div
      class="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20"
    >
      <span class="i-lucide-sparkles text-lg"></span>
    </div>
    <div>
      <div flex items-center gap-1.5>
        <span font-bold text-sm text-slate-100 tracking-tight>Prompt2Change</span>
        <span
          class="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
        >
          BYOK
        </span>
      </div>
      <p class="text-xs text-slate-400 truncate max-w-[160px]" title={hostname}>
        {hostname || 'No active website'}
      </p>
    </div>
  </div>

  <div flex items-center gap-1.5>
    <button
      type="button"
      title="One-click Templates Catalog"
      onclick={onToggleTemplates}
      class="px-2 py-1 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors duration-150 {showTemplates ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'}"
    >
      <span class="i-lucide-layout-grid text-xs"></span>
      <span>Presets</span>
    </button>

    <button
      type="button"
      title="Reset all styles for this site"
      onclick={onReset}
      class="p-1.5 text-xs rounded-lg bg-slate-800 hover:bg-red-950/60 hover:text-red-400 text-slate-400 border border-slate-700/80 hover:border-red-800/60 transition-colors duration-150"
    >
      <span class="i-lucide-rotate-ccw text-xs"></span>
    </button>

    <button
      type="button"
      title="BYOK & Model Settings"
      onclick={onOpenSettings}
      class="p-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors duration-150"
    >
      <span class="i-lucide-settings text-xs"></span>
    </button>
  </div>
</header>
