import { defineContentScript } from 'wxt/utils/define-content-script';
import type { PageSummary, RemixStyle, TargetElementInfo } from '../utils/types';
import { getSiteStyles } from '../utils/storage';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    const STYLE_TAG_ID = 'prompt2change-injected-styles';
    const SCRIPT_CONTAINER_ID = 'prompt2change-injected-scripts';
    const OVERLAY_ID = 'prompt2change-picker-overlay';
    const TOOLTIP_ID = 'prompt2change-picker-tooltip';

    let isPickerActive = false;
    let hoveredElement: HTMLElement | null = null;
    let overlayEl: HTMLElement | null = null;
    let tooltipEl: HTMLElement | null = null;

    // =========================================================================
    // STYLE & SCRIPT INJECTION
    // =========================================================================

    function applyStyles(styles: RemixStyle[]) {
      const activeStyles = styles.filter((s) => s.enabled);

      // Invert or inject CSS
      let styleTag = document.getElementById(STYLE_TAG_ID) as HTMLStyleElement | null;
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = STYLE_TAG_ID;
        (document.head || document.documentElement).appendChild(styleTag);
      }

      const combinedCss = activeStyles
        .map((s) => `/* Style: ${s.title} */\n${s.css || ''}`)
        .join('\n\n');

      styleTag.textContent = combinedCss;

      // Execute JavaScript safely in content script context
      for (const style of activeStyles) {
        if (style.js && style.js.trim()) {
          try {
            // Self-invoking function execution
            const fn = new Function(style.js);
            fn.call(window);
          } catch (err) {
            console.warn('[Prompt2Change] Error running style script:', err);
          }
        }
      }
    }

    async function loadAndApplySiteStyles() {
      try {
        const hostname = window.location.hostname;
        if (!hostname) return;
        const styles = await getSiteStyles(hostname);
        applyStyles(styles);
      } catch (err) {
        console.error('[Prompt2Change] Failed to load site styles:', err);
      }
    }

    // =========================================================================
    // PAGE SUMMARY EXTRACTION
    // =========================================================================

    function extractPageSummary(): PageSummary {
      const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') ||
        document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';

      const headings: string[] = [];
      document.querySelectorAll('h1, h2, h3').forEach((el, index) => {
        if (index < 6 && el.textContent) {
          const text = el.textContent.trim().replace(/\s+/g, ' ');
          if (text) headings.push(text);
        }
      });

      const mainTags: string[] = [];
      ['header', 'nav', 'main', 'article', 'aside', 'footer', 'form'].forEach((tag) => {
        if (document.querySelector(tag)) {
          mainTags.push(tag);
        }
      });

      return {
        url: window.location.href,
        hostname: window.location.hostname,
        title: document.title || window.location.hostname,
        description: metaDesc.slice(0, 300),
        headings,
        mainTags,
      };
    }

    // =========================================================================
    // ELEMENT PICKER / TARGET SELECTOR
    // =========================================================================

    function computeSelector(el: HTMLElement): string {
      if (el.id) return `#${CSS.escape(el.id)}`;
      const tag = el.tagName.toLowerCase();
      const classes = Array.from(el.classList || [])
        .filter((c) => !c.startsWith('prompt2change-'))
        .slice(0, 2);

      const classPart = classes.length ? `.${classes.map((c) => CSS.escape(c)).join('.')}` : '';
      let selector = `${tag}${classPart}`;

      if (el.parentElement) {
        const parentTag = el.parentElement.tagName.toLowerCase();
        const parentId = el.parentElement.id ? `#${CSS.escape(el.parentElement.id)}` : '';
        if (parentId) {
          selector = `${parentTag}${parentId} > ${selector}`;
        }
      }
      return selector;
    }

    function computeDescriptor(el: HTMLElement): string {
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : '';
      const classes = Array.from(el.classList || []).slice(0, 2).map((c) => `.${c}`).join('');
      const text = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      const label = text ? ` ("${text}")` : '';
      return `${tag}${id}${classes}${label}`;
    }

    function createPickerUI() {
      if (!overlayEl) {
        overlayEl = document.createElement('div');
        overlayEl.id = OVERLAY_ID;
        overlayEl.style.position = 'fixed';
        overlayEl.style.pointerEvents = 'none';
        overlayEl.style.zIndex = '2147483646';
        overlayEl.style.border = '2px solid #6366f1';
        overlayEl.style.backgroundColor = 'rgba(99, 102, 241, 0.18)';
        overlayEl.style.boxShadow = '0 0 12px rgba(99, 102, 241, 0.5)';
        overlayEl.style.borderRadius = '4px';
        overlayEl.style.transition = 'all 0.08s ease-out';
        overlayEl.style.display = 'none';
        document.body.appendChild(overlayEl);
      }

      if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = TOOLTIP_ID;
        tooltipEl.style.position = 'fixed';
        tooltipEl.style.pointerEvents = 'none';
        tooltipEl.style.zIndex = '2147483647';
        tooltipEl.style.backgroundColor = '#18181b';
        tooltipEl.style.color = '#fafafa';
        tooltipEl.style.fontFamily = 'monospace, sans-serif';
        tooltipEl.style.fontSize = '11px';
        tooltipEl.style.padding = '4px 8px';
        tooltipEl.style.borderRadius = '4px';
        tooltipEl.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
        tooltipEl.style.border = '1px solid #3f3f46';
        tooltipEl.style.display = 'none';
        document.body.appendChild(tooltipEl);
      }
    }

    function updatePickerPosition(target: HTMLElement) {
      if (!overlayEl || !tooltipEl) return;
      const rect = target.getBoundingClientRect();

      overlayEl.style.display = 'block';
      overlayEl.style.top = `${rect.top}px`;
      overlayEl.style.left = `${rect.left}px`;
      overlayEl.style.width = `${rect.width}px`;
      overlayEl.style.height = `${rect.height}px`;

      tooltipEl.style.display = 'block';
      const tooltipTop = rect.top > 32 ? rect.top - 28 : rect.bottom + 6;
      tooltipEl.style.top = `${tooltipTop}px`;
      tooltipEl.style.left = `${Math.max(8, rect.left)}px`;
      tooltipEl.textContent = `${computeDescriptor(target)}  [Click to select • Esc to cancel]`;
    }

    function handleMouseMove(e: MouseEvent) {
      if (!isPickerActive) return;
      const target = e.target as HTMLElement | null;
      if (!target || target === overlayEl || target === tooltipEl) return;
      hoveredElement = target;
      updatePickerPosition(target);
    }

    function handleClick(e: MouseEvent) {
      if (!isPickerActive || !hoveredElement) return;
      e.preventDefault();
      e.stopPropagation();

      const el = hoveredElement;
      const selector = computeSelector(el);
      const descriptor = computeDescriptor(el);
      const outerHTML = el.outerHTML || '';
      const text = (el.innerText || el.textContent || '').trim().slice(0, 300);

      const targetData: TargetElementInfo = {
        selector,
        descriptor,
        label: text || descriptor,
        context: {
          beforeHTML: '',
          afterHTML: '',
          outerHTML: outerHTML.slice(0, 2000),
          text,
        },
      };

      stopPicker();

      browser.runtime.sendMessage({
        type: 'TARGET_SELECTED',
        targetData,
      });
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isPickerActive) {
        stopPicker();
      }
    }

    function startPicker() {
      createPickerUI();
      isPickerActive = true;
      document.addEventListener('mousemove', handleMouseMove, true);
      document.addEventListener('click', handleClick, true);
      document.addEventListener('keydown', handleKeyDown, true);
      document.body.style.cursor = 'crosshair';
    }

    function stopPicker() {
      isPickerActive = false;
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.cursor = '';

      if (overlayEl) overlayEl.style.display = 'none';
      if (tooltipEl) tooltipEl.style.display = 'none';
    }

    // =========================================================================
    // RUNTIME MESSAGE LISTENERS
    // =========================================================================

    browser.runtime.onMessage.addListener((message: any, _sender, sendResponse) => {
      if (message.type === 'GET_PAGE_SUMMARY') {
        sendResponse(extractPageSummary());
        return true;
      }

      if (message.type === 'APPLY_STYLES') {
        if (Array.isArray(message.styles)) {
          applyStyles(message.styles);
        } else {
          loadAndApplySiteStyles();
        }
        sendResponse({ success: true });
        return true;
      }

      if (message.type === 'START_PICKER') {
        startPicker();
        sendResponse({ started: true });
        return true;
      }

      if (message.type === 'STOP_PICKER') {
        stopPicker();
        sendResponse({ stopped: true });
        return true;
      }
    });

    // Initialize site styles on load
    loadAndApplySiteStyles();
  },
});
