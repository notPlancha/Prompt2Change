<script lang="ts">
  interface Props {
    usageCount: number;
    activeCount: number;
  }

  let { usageCount, activeCount }: Props = $props();
</script>

<footer class="flex items-center justify-between px-4 py-2.5 border-t border-slate-800/80 bg-slate-950/60 text-[11px] text-slate-500">
  <div flex items-center gap-1.5>
    <span class="i-lucide-activity text-slate-400"></span>
    <span>{usageCount} calls this month</span>
  </div>

  <div flex items-center gap-3>
    {#if activeCount > 0}
      <span class="flex items-center gap-1 text-indigo-400 font-medium">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>{activeCount} active</span>
      </span>
    {/if}

    <a
      href="https://github.com/notPlancha/Prompt2Change"
      target="_blank"
      rel="noopener noreferrer"
      title="Open Source on GitHub"
      class="hover:text-slate-300 flex items-center gap-1 transition-colors"
    >
      <span class="i-lucide-github text-xs"></span>
      <span>GitHub</span>
    </a>
  </div>
</footer>
