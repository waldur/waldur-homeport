/**
 * ESLint rule: every class name must style something.
 *
 * Tailwind and Bootstrap both ignore a class they do not know, so a typo
 * (`felx`, `text-teritary`, `gap-44x`, `md:hiden`) or a class whose
 * stylesheet was retired renders as nothing at all, with no warning from the
 * build, the type checker or the browser. This rule asks the same Tailwind
 * design system the build uses whether it generates CSS for each class, and
 * otherwise looks the class up among the selectors of every stylesheet the
 * app compiles or imports (lib/class-oracle.js). A class in neither is
 * reported, with the nearest real class as a hint when there is one.
 *
 * Only class positions are read, so ordinary strings are never mistaken for
 * class lists:
 *
 *   - `className` / `class` and any `*ClassName` attribute or property;
 *   - the arguments of cn / clsx / classNames / cx / twMerge (string
 *     arguments, and object keys);
 *   - cva(base, { variants }) — the base and the variant values, and the
 *     `class` / `className` of compoundVariants;
 *   - a variable whose name ends in `class`, `classes` or `className`, in
 *     any case (`activeClass`, `BASE_CLASSNAME`).
 *
 * A `const` used in a class position is followed to its value, in the same
 * file: `className={BASE}` checks BASE's string, `cn(SIZES[size])` checks
 * every value of the SIZES object, `cn(TONE.danger)` checks that one entry.
 * Imports, parameters and `let` are not followed.
 *
 * Only static text is judged: a token that touches a `${…}` in a template
 * literal (`text-${tone}`) is a fragment, not a class, and is skipped.
 *
 * Classes that predate the rule are listed per file in
 * unknown-classes.baseline.json at the repository root. A listed class is
 * not reported in that file; any other unknown class is, however many listed
 * ones the same change removes. A listed class that the file no longer has
 * (fixed, or now defined by a stylesheet) is reported as stale, so the list
 * only shrinks. `yarn lint:classes:baseline` rewrites it.
 *
 * A class that deliberately styles nothing — a hook for a test selector or a
 * third-party script — goes in the rule's `allow` option (regexes), so each
 * one is a visible decision rather than an exception hidden in the source.
 */

import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { createSyncFn } from 'synckit';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// The repository root, from where this file lives rather than the process's
// working directory, so running ESLint from a subdirectory (or an editor
// with per-folder working directories) resolves the same entry point.
const REPO_ROOT = path.resolve(HERE, '../../..');

const BASELINE_FILE = 'unknown-classes.baseline.json';

// Set by scripts/unknown-classes-baseline.mjs to see every unknown class.
const IGNORE_BASELINE = process.env.WALDUR_UNKNOWN_CLASS_BASELINE === 'ignore';

const askOracle = createSyncFn(
  path.join(HERE, '../lib/class-oracle.worker.js'),
);

const CLASS_HELPERS = /^(?:classNames|classnames|cn|clsx|cx|twMerge)$/;
const CLASS_NAME = /^(?:class|className|\w+ClassName)$/;
const CLASS_VARIABLE = /(?:class|classes|class_?names?)$/i;

// `group` / `peer` (optionally named) mark an element for group-* / peer-*
// variants and emit no CSS of their own.
const BUILTIN_MARKERS = /^(?:group|peer)(?:\/[\w-]+)?$/;

const calleeName = (callee) =>
  callee.type === 'Identifier'
    ? callee.name
    : callee.type === 'MemberExpression' && !callee.computed
      ? callee.property.name
      : null;

const propertyName = (property) =>
  property.type === 'Property' && !property.computed
    ? (property.key.name ?? property.key.value)
    : null;

const unwrap = (node) =>
  node &&
  (node.type === 'TSAsExpression' || node.type === 'TSSatisfiesExpression')
    ? unwrap(node.expression)
    : node;

let baseline = { mtimeMs: -1, entries: {} };

/** unknown-classes.baseline.json, re-read when it changes on disk. */
const readBaseline = (file) => {
  try {
    const { mtimeMs } = statSync(file);
    if (mtimeMs !== baseline.mtimeMs) {
      baseline = { mtimeMs, entries: JSON.parse(readFileSync(file, 'utf8')) };
    }
  } catch {
    baseline = { mtimeMs: -1, entries: {} };
  }
  return baseline.entries;
};

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Report class names that neither Tailwind nor any stylesheet defines',
      category: 'Possible Errors',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          entryPoint: { type: 'string' },
          allow: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unknown:
        '"{{ token }}" is not a Tailwind utility and no stylesheet defines it, so it styles nothing.{{ hint }}',
      stale:
        '"{{ token }}" is listed for this file in unknown-classes.baseline.json, but the file no longer has it as an unknown class (fixed, removed, or now defined). Run `yarn lint:classes:baseline` to update the list.',
    },
  },

  create(context) {
    const options = context.options[0] ?? {};
    const entryPoint = options.entryPoint ?? 'src/tailwind.css';
    const allow = (options.allow ?? []).map((source) => new RegExp(source));
    const sourceCode = context.sourceCode;
    const relativeFile = path
      .relative(REPO_ROOT, context.filename)
      .split(path.sep)
      .join('/');

    /** token → nodes it was found on */
    const found = new Map();
    const add = (token, node) => {
      if (!token || BUILTIN_MARKERS.test(token)) return;
      if (allow.some((pattern) => pattern.test(token))) return;
      if (!found.has(token)) found.set(token, new Set());
      found.get(token).add(node);
    };

    const addString = (text, node) => {
      for (const token of text.split(/\s+/)) add(token, node);
    };

    /** The initialiser of the `const` an identifier names, if any. */
    const resolveConst = (identifier) => {
      for (
        let scope = sourceCode.getScope(identifier);
        scope;
        scope = scope.upper
      ) {
        const variable = scope.set.get(identifier.name);
        if (!variable) continue;
        const def = variable.defs[0];
        if (
          def?.type === 'Variable' &&
          def.parent?.kind === 'const' &&
          def.node.id.type === 'Identifier'
        ) {
          return unwrap(def.node.init);
        }
        return null;
      }
      return null;
    };

    /** An object literal an expression evaluates to: `X`, `X.y`, `X['y']`. */
    const resolveObject = (node) => {
      node = unwrap(node);
      if (node?.type === 'ObjectExpression') return node;
      if (node?.type === 'Identifier') return resolveObject(resolveConst(node));
      if (node?.type === 'MemberExpression') {
        const value = memberValue(node);
        return value && resolveObject(value);
      }
      return null;
    };

    /** `X.y` → the y property's value; null when the key is computed. */
    const memberValue = (node) => {
      const object = resolveObject(node.object);
      if (!object) return null;
      const key = node.computed
        ? node.property.type === 'Literal'
          ? node.property.value
          : null
        : node.property.name;
      if (key == null) return null;
      const property = object.properties.find((p) => propertyName(p) === key);
      return property ? unwrap(property.value) : null;
    };

    const followed = new WeakSet();
    const follow = (node) => {
      if (!node || followed.has(node)) return;
      followed.add(node);
      collect(node);
    };

    const collect = (node) => {
      node = unwrap(node);
      if (!node) return;
      switch (node.type) {
        case 'Literal':
          if (typeof node.value === 'string') addString(node.value, node);
          break;
        case 'TemplateLiteral':
          node.quasis.forEach((quasi, i) => {
            const tokens = (quasi.value.cooked ?? '').split(/(\s+)/);
            // A token glued to `${…}` on either side is only a fragment.
            if (i > 0) tokens[0] = '';
            if (i < node.quasis.length - 1) tokens[tokens.length - 1] = '';
            for (const token of tokens) add(token.trim(), quasi);
          });
          // An expression standing alone between spaces is a whole class
          // list (`${active ? 'a' : 'b'}`); one glued to text is a fragment.
          node.expressions.forEach((expression, i) => {
            const before = node.quasis[i].value.cooked ?? '';
            const after = node.quasis[i + 1].value.cooked ?? '';
            if (/(^|\s)$/.test(before) && /^($|\s)/.test(after)) {
              collect(expression);
            }
          });
          break;
        case 'JSXExpressionContainer':
          collect(node.expression);
          break;
        case 'ConditionalExpression':
          collect(node.consequent);
          collect(node.alternate);
          break;
        case 'LogicalExpression':
          // `cond && 'x'`: the left side is a condition, not classes.
          if (node.operator !== '&&') collect(node.left);
          collect(node.right);
          break;
        case 'ArrayExpression':
          node.elements.forEach(collect);
          break;
        case 'ObjectExpression':
          // Reached through a const map (`SIZES[size]`): its values are the
          // class lists.
          for (const property of node.properties) {
            if (property.type === 'Property') collect(property.value);
          }
          break;
        case 'Identifier':
          follow(resolveConst(node));
          break;
        case 'MemberExpression': {
          const value = memberValue(node);
          if (value) follow(value);
          else if (node.computed) follow(resolveObject(node.object));
          break;
        }
        case 'CallExpression':
          collectCall(node);
          break;
        default:
          break;
      }
    };

    /** Arguments of a class helper; object keys are classes there. */
    const collectHelperArgs = (args) => {
      for (const arg of args) {
        if (arg.type === 'ObjectExpression') {
          for (const property of arg.properties) {
            if (property.type !== 'Property' || property.computed) continue;
            if (property.key.type === 'Literal') collect(property.key);
            else if (property.key.type === 'Identifier')
              add(property.key.name, property.key);
          }
        } else {
          collect(arg);
        }
      }
    };

    /** cva(base, { variants: { size: { sm: '…' } }, compoundVariants }) */
    const collectCva = ([base, config]) => {
      collect(base);
      if (config?.type !== 'ObjectExpression') return;
      for (const section of config.properties) {
        const name = propertyName(section);
        if (name === 'variants' && section.value.type === 'ObjectExpression') {
          for (const variant of section.value.properties) {
            if (variant.value?.type !== 'ObjectExpression') continue;
            for (const option of variant.value.properties) {
              if (option.type === 'Property') collect(option.value);
            }
          }
        } else if (
          name === 'compoundVariants' &&
          section.value.type === 'ArrayExpression'
        ) {
          for (const compound of section.value.elements) {
            if (compound?.type !== 'ObjectExpression') continue;
            for (const property of compound.properties) {
              if (CLASS_NAME.test(propertyName(property) ?? ''))
                collect(property.value);
            }
          }
        }
      }
    };

    const visited = new WeakSet();
    const collectCall = (node) => {
      if (visited.has(node)) return;
      visited.add(node);
      const name = calleeName(node.callee) ?? '';
      if (CLASS_HELPERS.test(name)) collectHelperArgs(node.arguments);
      else if (name === 'cva') collectCva(node.arguments);
    };

    // An object literal is a class map only when it is used as one
    // (`SIZES[size]` in a class position, followed above). One met by name
    // alone — `LABEL_CLASSES` holding badge variants, a Storybook
    // `className: { control: 'text' }` argType — is something else.
    const collectNamed = (value) => {
      if (unwrap(value)?.type !== 'ObjectExpression') collect(value);
    };

    return {
      JSXAttribute(node) {
        if (CLASS_NAME.test(node.name.name ?? '')) collectNamed(node.value);
      },
      Property(node) {
        if (CLASS_NAME.test(propertyName(node) ?? '')) collectNamed(node.value);
      },
      VariableDeclarator(node) {
        if (
          node.id.type === 'Identifier' &&
          CLASS_VARIABLE.test(node.id.name) &&
          node.init
        ) {
          collectNamed(node.init);
        }
      },
      CallExpression: collectCall,

      'Program:exit'(program) {
        const listed = IGNORE_BASELINE
          ? []
          : (readBaseline(path.join(REPO_ROOT, BASELINE_FILE))[relativeFile] ??
            []);
        if (!found.size && !listed.length) return;

        const unknown = found.size
          ? askOracle({
              root: REPO_ROOT,
              entryPoint,
              tokens: [...found.keys()],
            })
          : [];
        const unknownTokens = new Set(unknown.map(({ token }) => token));

        for (const { token, suggestion } of unknown) {
          if (listed.includes(token)) continue;
          for (const node of found.get(token)) {
            context.report({
              node,
              messageId: 'unknown',
              data: {
                token,
                hint: suggestion ? ` Did you mean "${suggestion}"?` : '',
              },
            });
          }
        }
        for (const token of listed) {
          if (!unknownTokens.has(token)) {
            context.report({
              node: program,
              loc: { line: 1, column: 0 },
              messageId: 'stale',
              data: { token },
            });
          }
        }
      },
    };
  },
};
