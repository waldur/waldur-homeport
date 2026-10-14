/**
 * Reads the token stylesheets themselves, so the Foundations stories list
 * what the CSS declares rather than a hand-kept copy of it: a token added,
 * renamed or re-pointed shows up in Storybook with no edit to a story.
 *
 * The files are plain custom-property blocks (`:root`, the dark-theme block,
 * the sidebar styles) with a comment above a declaration when it needs one,
 * which is all this parser understands. A Tailwind `@theme` block is read the
 * same way, for the utilities that expose a token.
 */

export type Token = {
  name: string;
  /** Value per block, keyed by the block's label (`light`, `dark`, …). */
  values: Record<string, string>;
  /** The comment directly above the first declaration, if any. */
  note?: string;
  /** A short heading comment (such as "Surfaces") that starts a group here. */
  section?: string;
};

export type TokenFile = {
  /**
   * The file's leading docblock without the comment markers: paragraphs
   * separated by a blank line, an indented paragraph kept as written.
   */
  doc: string;
  /** Block labels in source order. */
  blocks: string[];
  tokens: Token[];
};

const cleanComment = (comment: string) =>
  comment
    .replace(/^\/\*+|\*+\/$/g, '')
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, '').trim())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * `:root` → light, the dark-theme block → dark, any other attribute block by
 * its value and attribute (`[data-sidebar-style='light']` → `light style`),
 * so it never shares a column with a theme.
 */
const blockLabel = (selector: string) => {
  const s = selector.replace(/\s+/g, ' ').trim();
  if (s === ':root' || s.startsWith('@theme')) return 'light';
  if (/data-theme=['"]?dark/.test(s)) return 'dark';
  const attr = /\[data-(?:[\w-]+-)?([\w]+)=\s*['"]?([\w-]+)/.exec(s);
  return attr ? `${attr[2]} ${attr[1]}` : s;
};

/** A comment that names a group rather than explaining a token. */
const isHeading = (text: string) =>
  !/[.:;]/.test(text) && text.split(' ').length <= 4;

/**
 * Top-level `selector { body }` blocks. Braces and semicolons inside a
 * comment do not count (a note may quote CSS), and comments between blocks
 * are dropped; the ones inside a block are kept, as they document the
 * declaration below them.
 */
function topLevelBlocks(css: string) {
  const blocks: { selector: string; body: string }[] = [];
  let selector = '';
  let body = '';
  let depth = 0;
  for (let i = 0; i < css.length; i++) {
    if (css.startsWith('/*', i)) {
      const end = css.indexOf('*/', i + 2);
      const stop = end === -1 ? css.length : end + 2;
      if (depth > 0) body += css.slice(i, stop);
      i = stop - 1;
      continue;
    }
    const ch = css[i];
    if (ch === '{') {
      if (depth > 0) body += ch;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        blocks.push({ selector: selector.trim(), body });
        selector = '';
        body = '';
      } else body += ch;
    } else if (depth > 0) body += ch;
    else if (ch === ';')
      selector = ''; // the end of an @import
    else selector += ch;
  }
  return blocks;
}

/**
 * A docblock as paragraphs separated by blank lines. Indented lines (an
 * aligned list of tokens) keep their line breaks and indentation; other
 * lines of a paragraph are joined.
 */
const cleanDoc = (comment: string) =>
  comment
    .replace(/^\/\*+|\*+\/$/g, '')
    .split('\n')
    .map((line) => line.replace(/^\s*\*( |$)/, '').replace(/\s+$/, ''))
    .join('\n')
    .trim()
    .split(/\n\s*\n/)
    .map((para) =>
      para.split('\n').every((line) => /^\s{2,}/.test(line))
        ? para
        : para.replace(/\s*\n\s*/g, ' '),
    )
    .join('\n\n');

export function parseTokenFile(css: string): TokenFile {
  const docMatch = /^\s*\/\*\*([\s\S]*?)\*\//.exec(css);
  const doc = docMatch ? cleanDoc(docMatch[0]) : '';
  const rest = docMatch ? css.slice(docMatch.index + docMatch[0].length) : css;

  const byName = new Map<string, Token>();
  const blocks: string[] = [];
  for (const { selector, body } of topLevelBlocks(rest)) {
    if (!selector) continue;
    const label = blockLabel(selector);
    if (!blocks.includes(label)) blocks.push(label);
    let pending: string | undefined;
    let heading: string | undefined;
    for (const m of body.matchAll(
      /(\/\*[\s\S]*?\*\/)|(--[\w-]+)\s*:\s*([^;]+);/g,
    )) {
      if (m[1]) {
        const text = cleanComment(m[1]);
        // A heading may be followed by the first token's own note.
        if (isHeading(text) && !pending) heading = text;
        else pending = text;
        continue;
      }
      const name = m[2];
      const isNew = !byName.has(name);
      const token = byName.get(name) ?? { name, values: {} };
      token.values[label] = m[3].replace(/\s+/g, ' ').trim();
      if (heading && isNew) token.section = heading;
      if (pending && !token.note) token.note = pending;
      pending = undefined;
      heading = undefined;
      byName.set(name, token);
    }
  }
  return { doc, blocks, tokens: [...byName.values()] };
}

/** Tailwind theme namespaces that name a colour utility, longest first. */
const NAMESPACES: [string, string][] = [
  ['--background-color-', 'bg-'],
  ['--outline-color-', 'outline-'],
  ['--border-color-', 'border-'],
  ['--text-color-', 'text-'],
];

/**
 * Utilities per token, from a Tailwind `@theme` block whose keys point at a
 * token (`--text-color-tertiary: var(--text-tertiary)` → `text-tertiary`).
 */
export function utilitiesByToken(themeCss: string): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const m of themeCss.matchAll(
    /(--[\w-]+)\s*:\s*var\((--[\w-]+)\)\s*;/g,
  )) {
    const [, key, token] = m;
    const ns = NAMESPACES.find(([prefix]) => key.startsWith(prefix));
    if (!ns) continue;
    const utility = ns[1] + key.slice(ns[0].length);
    out.set(token, [...(out.get(token) ?? []), utility]);
  }
  return out;
}

/** `var(--color-gray-600)` → `gray-600`, `var(--brand-300)` → `brand-300`. */
export const shortValue = (value: string) =>
  value
    .replace(/var\(--color-([\w-]+)\)/g, '$1')
    .replace(/var\(--(brand-[\w-]+)\)/g, '$1');
