import type { RemixStyle, SiteSettings, RateLimitStats, TargetElementInfo } from './types';

const DEFAULT_SETTINGS: SiteSettings = {
  apiKey: '',
  model: 'openai/gpt-5.1-codex-mini',
  endpoint: 'https://openrouter.ai/api/v1/chat/completions',
  autoApply: true,
  allowJs: true,
};

function getStorageArea() {
  if (typeof browser !== 'undefined' && browser.storage?.local) {
    return browser.storage.local;
  }
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    return chrome.storage.local;
  }
  throw new Error('WebExtension storage is not available.');
}

export async function getSiteStyles(hostname: string): Promise<RemixStyle[]> {
  try {
    const storage = getStorageArea();
    const key = `styles_${hostname}`;
    const result = await storage.get(key);
    return (result[key] as RemixStyle[]) || [];
  } catch (err) {
    console.error('Failed to get site styles:', err);
    return [];
  }
}

export async function saveSiteStyles(hostname: string, styles: RemixStyle[]): Promise<void> {
  const storage = getStorageArea();
  const key = `styles_${hostname}`;
  await storage.set({ [key]: styles });
}

export async function resetSiteStyles(hostname: string): Promise<void> {
  const storage = getStorageArea();
  const key = `styles_${hostname}`;
  await storage.remove(key);
}

export async function getSettings(): Promise<SiteSettings> {
  try {
    const storage = getStorageArea();
    const result = await storage.get('prompt2change_settings');
    return { ...DEFAULT_SETTINGS, ...(result.prompt2change_settings as Partial<SiteSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const storage = getStorageArea();
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await storage.set({ prompt2change_settings: updated });
  return updated;
}

export async function getUsageStats(): Promise<RateLimitStats> {
  try {
    const storage = getStorageArea();
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const result = await storage.get('prompt2change_usage');
    const stats = result.prompt2change_usage as RateLimitStats | undefined;

    if (!stats || stats.month !== currentMonth) {
      const fresh: RateLimitStats = {
        month: currentMonth,
        count: 0,
        lastReset: Date.now(),
      };
      await storage.set({ prompt2change_usage: fresh });
      return fresh;
    }
    return stats;
  } catch {
    return { month: '', count: 0, lastReset: Date.now() };
  }
}

export async function incrementUsage(): Promise<number> {
  const storage = getStorageArea();
  const current = await getUsageStats();
  const updated: RateLimitStats = {
    ...current,
    count: current.count + 1,
  };
  await storage.set({ prompt2change_usage: updated });
  return updated.count;
}

export async function getTargetSelection(tabId: number): Promise<TargetElementInfo | null> {
  try {
    const storage = getStorageArea();
    const key = `target_selection_${tabId}`;
    const res = await storage.get(key);
    return (res[key] as TargetElementInfo) || null;
  } catch {
    return null;
  }
}

export async function setTargetSelection(tabId: number, target: TargetElementInfo | null): Promise<void> {
  const storage = getStorageArea();
  const key = `target_selection_${tabId}`;
  if (target) {
    await storage.set({ [key]: target });
  } else {
    await storage.remove(key);
  }
}
