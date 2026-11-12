/**
 * ESLint rule: inline code and keys are waldur-ui's Code and Kbd, never a
 * bare <code> or <kbd>.
 *
 * Legacy styles styled every `code` element globally, so a bare tag looked right
 * anywhere and code that wanted another look had to fight the global rule.
 * That rule is gone: the look now lives in the components, on semantic
 * tokens (--text-code, --bg-code, --inline-shadow), and a bare tag renders as plain monospace text. Markdown and HTML
 * the app renders (SafeMarkdown, FormattedHtml, …) carry `.rich-text`, which
 * styles the code inside them the same way.
 *
 * A <code> directly inside a <pre> (or produced by an expression there) is a
 * code block, not inline code, and stays as it is.
 */

const REPLACEMENTS = { code: 'Code', kbd: 'Kbd' };

// Whether the nearest enclosing element is a <pre>, looking through the
// expressions between them (`<pre>{lines.map((l) => <code>…</code>)}</pre>`).
const isInPre = (element) => {
  let node = element.parent;
  while (node && node.type !== 'JSXElement' && node.type !== 'JSXFragment') {
    node = node.parent;
  }
  return (
    node?.type === 'JSXElement' &&
    node.openingElement.name.type === 'JSXIdentifier' &&
    node.openingElement.name.name === 'pre'
  );
};

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Disallow bare <code> and <kbd>; use waldur-ui's Code and Kbd",
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
    messages: {
      raw: "Bare <{{tag}}> is not styled: use waldur-ui's <{{replacement}}> (import { {{replacement}} } from 'waldur-ui').",
    },
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name.type !== 'JSXIdentifier') return;
        const tag = node.name.name;
        const replacement = REPLACEMENTS[tag];
        if (!replacement) return;
        if (tag === 'code' && isInPre(node.parent)) return;
        context.report({ node, messageId: 'raw', data: { tag, replacement } });
      },
    };
  },
};
