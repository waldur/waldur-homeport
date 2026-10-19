import type { HtmlTagDescriptor, Plugin } from 'vite';

export interface BootSplashOptions {
  /** The name shown before any visit has cached the deployment's own. */
  defaultName?: string;
}

/** `file` under the app's `base`, as its index.html refers to it. */
export function scriptPath(base: string, file: string): string;
/** The built branding script's content-hashed path under `assetsDir`. */
export function hashedScriptFile(assetsDir: string, source?: string): string;
/** The splash markup, with the default name filled in. */
export function splashMarkup(options?: BootSplashOptions): string;
/** The splash's <head> tags: the branding script at `src`, its styles. */
export function bootSplashHeadTags(src: string): HtmlTagDescriptor[];
/** index.html with the splash added: head tags, and markup last in <body>. */
export function injectBootSplash(
  html: string,
  src: string,
  options?: BootSplashOptions,
): { html: string; tags: HtmlTagDescriptor[] };
export function waldurBootSplash(options?: BootSplashOptions): Plugin;
