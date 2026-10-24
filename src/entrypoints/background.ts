import { defineBackground } from 'wxt/utils/define-background';
import { callAIModel } from '../utils/ai';
import { getSiteStyles, setTargetSelection } from '../utils/storage';

export default defineBackground(() => {
  console.log('[Prompt2Change] Background service initialized.');

  // Update badge for a specific tab based on stored active styles
  async function refreshBadge(tabId: number, url?: string) {
    try {
      if (!url) {
        const tab = await browser.tabs.get(tabId);
        url = tab.url;
      }
      if (!url || !url.startsWith('http')) {
        await browser.action.setBadgeText({ tabId, text: '' });
        return;
      }

      const hostname = new URL(url).hostname;
      const styles = await getSiteStyles(hostname);
      const activeCount = styles.filter((s) => s.enabled).length;

      if (activeCount > 0) {
        await browser.action.setBadgeText({ tabId, text: String(activeCount) });
        await browser.action.setBadgeBackgroundColor({ tabId, color: '#6366f1' });
      } else {
        await browser.action.setBadgeText({ tabId, text: '' });
      }
    } catch {
      // Ignored for restricted browser pages
    }
  }

  // Tab navigation listeners
  browser.tabs.onActivated.addListener((info) => {
    refreshBadge(info.tabId);
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      refreshBadge(tabId, tab.url);
    }
  });

  // Message dispatcher
  browser.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
    if (message.type === 'CALL_AI_MODEL') {
      callAIModel(
        message.instruction,
        message.pageSummary,
        message.targetSelection,
        message.existingStyle
      ).then((result) => {
        sendResponse(result);
      });
      return true; // Keep message channel open for async response
    }

    if (message.type === 'REFRESH_BADGE') {
      const tabId = message.tabId || sender.tab?.id;
      if (tabId) {
        refreshBadge(tabId, message.url).then(() => sendResponse({ ok: true }));
        return true;
      }
    }

    if (message.type === 'TARGET_SELECTED') {
      const tabId = message.tabId || sender.tab?.id;
      if (tabId) {
        setTargetSelection(tabId, message.targetData).then(() => {
          sendResponse({ ok: true });
        });
        return true;
      }
    }

    if (message.type === 'CLEAR_TARGET') {
      const tabId = message.tabId || sender.tab?.id;
      if (tabId) {
        setTargetSelection(tabId, null).then(() => {
          sendResponse({ ok: true });
        });
        return true;
      }
    }
  });
});
