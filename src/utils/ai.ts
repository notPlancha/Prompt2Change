import type { ModelCallResult, PageSummary, TargetElementInfo, RemixStyle } from './types';
import { getSettings, incrementUsage } from './storage';

export const POPULAR_MODELS = [
  { id: 'openai/gpt-5.1-codex-mini', name: 'GPT-5.1 Codex Mini (Recommended)', provider: 'OpenRouter' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Best UI/CSS)', provider: 'OpenRouter' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenRouter' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3 (Fast & Affordable)', provider: 'OpenRouter' },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'OpenRouter' },
  { id: 'custom', name: 'Custom Model ID...', provider: 'Custom' },
];

const SYSTEM_PROMPT = `
You are an expert web front-end styling and DOM manipulation assistant.
Your goal is to modify or restyle the current webpage safely and effectively based on the user's instructions.

CRITICAL RULES:
1. ONLY produce a single valid JSON object. No explanations or commentary outside the JSON block.
2. JSON structure MUST match:
{
  "summary": "Short concise title of the style (e.g. 'Dark Minimalist Theme', 'Hidden Sidebar')",
  "css": "Valid CSS code to inject into the page",
  "js": "Optional safe JavaScript to execute for DOM changes if CSS alone cannot achieve it",
  "notes": "Brief 1-sentence note of what changed"
}
3. Always prefer CSS for colors, fonts, layout, spacing, hiding elements (display: none !important), borders, shadows.
4. Use JavaScript ONLY when strictly necessary (e.g. moving DOM nodes, changing inner text, complex event interactions).
5. Never introduce infinite loops, alert popups, or code that breaks page navigation or inputs.
6. Use !important where appropriate to override aggressive website style rules.
7. If target context is provided, focus primarily on that element and its parent container.
`;

function buildPrompt(
  instruction: string,
  pageSummary: PageSummary,
  targetSelection?: TargetElementInfo | null,
  existingStyle?: RemixStyle | null
): string {
  let prompt = `=== USER INSTRUCTION ===\n"${instruction}"\n\n`;

  prompt += `=== PAGE CONTEXT ===\n`;
  prompt += `URL: ${pageSummary.url}\n`;
  prompt += `Title: ${pageSummary.title}\n`;
  if (pageSummary.description) {
    prompt += `Description: ${pageSummary.description}\n`;
  }
  if (pageSummary.headings && pageSummary.headings.length) {
    prompt += `Key Headings: ${pageSummary.headings.slice(0, 5).join(' | ')}\n`;
  }
  if (pageSummary.mainTags && pageSummary.mainTags.length) {
    prompt += `Structural Elements: ${pageSummary.mainTags.join(', ')}\n`;
  }
  prompt += `\n`;

  if (targetSelection) {
    prompt += `=== TARGETED ELEMENT ===\n`;
    prompt += `Selector / Descriptor: ${targetSelection.descriptor}\n`;
    if (targetSelection.label) {
      prompt += `Element Text/Label: "${targetSelection.label}"\n`;
    }
    if (targetSelection.context?.outerHTML) {
      const outer = targetSelection.context.outerHTML.slice(0, 1500);
      prompt += `Element HTML:\n${outer}\n`;
    }
    prompt += `\n`;
  }

  if (existingStyle) {
    prompt += `=== REFINEMENT CONTEXT ===\n`;
    prompt += `You are refining an existing style titled "${existingStyle.title}".\n`;
    prompt += `Original Instruction: "${existingStyle.instruction}"\n`;
    prompt += `Current CSS:\n${existingStyle.css || '/* none */'}\n`;
    if (existingStyle.js) {
      prompt += `Current JS:\n${existingStyle.js}\n`;
    }
    prompt += `Task: Update and build upon the existing CSS/JS to fulfill the new instruction while preserving previous intended tweaks.\n\n`;
  }

  prompt += `Return ONLY the JSON response.`;
  return prompt;
}

export async function callAIModel(
  instruction: string,
  pageSummary: PageSummary,
  targetSelection?: TargetElementInfo | null,
  existingStyle?: RemixStyle | null
): Promise<ModelCallResult> {
  const settings = await getSettings();

  if (!settings.apiKey) {
    return {
      success: false,
      error: 'API key is missing. Please open Settings and add your OpenRouter (or compatible) API key.',
    };
  }

  const endpoint = settings.endpoint || 'https://openrouter.ai/api/v1/chat/completions';
  const model = settings.model || 'openai/gpt-5.1-codex-mini';
  const userPrompt = buildPrompt(instruction, pageSummary, targetSelection, existingStyle);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${settings.apiKey.trim()}`,
  };

  if (endpoint.includes('openrouter.ai')) {
    headers['HTTP-Referer'] = 'https://github.com/notPlancha/Prompt2Change';
    headers['X-Title'] = 'Prompt2Change Firefox Extension';
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let message = `API request failed with status ${response.status}`;
      try {
        const errJson = JSON.parse(errText);
        if (errJson.error?.message) {
          message = errJson.error.message;
        }
      } catch {
        if (errText) message += `: ${errText.slice(0, 150)}`;
      }
      return { success: false, error: message };
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;

    if (!rawContent) {
      return { success: false, error: 'Empty response returned from model.' };
    }

    // Extract JSON block (strip possible ```json ... ```)
    const jsonMatch =
      rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
      rawContent.match(/\{[\s\S]*\}/);

    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawContent;
    const parsed = JSON.parse(jsonText);

    await incrementUsage();

    return {
      success: true,
      summary: parsed.summary || instruction.slice(0, 30),
      css: parsed.css || '',
      js: parsed.js || '',
      notes: parsed.notes || '',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Unknown network or parsing error occurred.',
    };
  }
}
