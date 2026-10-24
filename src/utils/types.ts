export interface RemixStyle {
  id: string;
  title: string;
  instruction: string;
  css: string;
  js: string;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
  targetSelector?: string;
  history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface SiteSettings {
  apiKey: string;
  model: string;
  endpoint: string;
  autoApply: boolean;
  allowJs: boolean;
}

export interface RateLimitStats {
  month: string;
  count: number;
  lastReset: number;
}

export interface TargetElementContext {
  beforeHTML: string;
  afterHTML: string;
  outerHTML: string;
  text: string;
}

export interface TargetElementInfo {
  descriptor: string;
  selector: string;
  label: string;
  context: TargetElementContext;
}

export interface PageSummary {
  url: string;
  hostname: string;
  title: string;
  description: string;
  headings: string[];
  mainTags: string[];
}

export interface ModelCallResult {
  success: boolean;
  css?: string;
  js?: string;
  summary?: string;
  notes?: string;
  error?: string;
}

export interface TemplatePreset {
  id: string;
  title: string;
  description: string;
  icon: string;
  css: string;
  js?: string;
}
