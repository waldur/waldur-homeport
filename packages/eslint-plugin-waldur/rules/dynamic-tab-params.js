/**
 * ESLint rule requiring tab and search URL params to be `dynamic` in route
 * definitions.
 *
 * Tab bars and search boxes keep their state in the URL (`?tab=…`, `?q=…`) and
 * write it with `router.stateService.go(state.name, { …params, tab })`. A param
 * that is not declared `dynamic` makes UI-Router exit and re-enter the state on
 * every change, which remounts the whole page: a flash on each tab switch, and a
 * search box that loses focus on every keystroke. A dynamic param only updates
 * the URL and re-renders.
 *
 * Applies to a route object (one with a string `url`) whose query string has a
 * param named `tab`, `q`, `*_tab` or `*Tab`. It is autofixable: the fixer adds
 * the missing `params` entry.
 */

const isRelevant = (name) => name === 'q' || /(^|_)tab$|Tab$/.test(name);

const queryParams = (url) => {
  const index = url.indexOf('?');
  if (index === -1) {
    return [];
  }
  return url
    .slice(index + 1)
    .split('&')
    .map((part) => part.split('=')[0].trim())
    .filter(Boolean);
};

const keyName = (property) => {
  if (property.type !== 'Property' || property.computed) {
    return null;
  }
  if (property.key.type === 'Identifier') {
    return property.key.name;
  }
  if (property.key.type === 'Literal') {
    return String(property.key.value);
  }
  return null;
};

const findProperty = (objectNode, name) =>
  objectNode.properties.find((property) => keyName(property) === name);

/** True when `params[name]` is an object with `dynamic: true`. */
const isDynamic = (paramsNode, name) => {
  if (!paramsNode || paramsNode.value.type !== 'ObjectExpression') {
    return false;
  }
  const entry = findProperty(paramsNode.value, name);
  if (!entry || entry.value.type !== 'ObjectExpression') {
    return false;
  }
  const dynamic = findProperty(entry.value, 'dynamic');
  return Boolean(
    dynamic && dynamic.value.type === 'Literal' && dynamic.value.value === true,
  );
};

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require tab and search URL params to be declared dynamic so changing them does not remount the page',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      notDynamic:
        'URL param "{{ name }}" changes on tab switch or search, so declare it dynamic; otherwise UI-Router remounts the whole page on every change.\n' +
        '  params: { {{ name }}: { dynamic: true } }',
    },
  },

  create(context) {
    return {
      ObjectExpression(node) {
        const urlProperty = findProperty(node, 'url');
        if (
          !urlProperty ||
          urlProperty.value.type !== 'Literal' ||
          typeof urlProperty.value.value !== 'string'
        ) {
          return;
        }
        const names = queryParams(urlProperty.value.value).filter(isRelevant);
        const paramsProperty = findProperty(node, 'params');
        const missing = names.filter(
          (name) => !isDynamic(paramsProperty, name),
        );
        if (missing.length === 0) {
          return;
        }
        // One report per route, fixed in one go so edits do not overlap.
        const source = context.sourceCode;
        context.report({
          node: urlProperty,
          messageId: 'notDynamic',
          data: { name: missing[0] },
          fix(fixer) {
            const entries = (existing) =>
              missing
                .filter((name) => !existing.has(name))
                .map((name) => `${name}: { dynamic: true }`);
            if (!paramsProperty) {
              return fixer.insertTextAfter(
                urlProperty,
                `,\nparams: { ${entries(new Set()).join(', ')} }`,
              );
            }
            if (paramsProperty.value.type !== 'ObjectExpression') {
              return null;
            }
            const paramsObject = paramsProperty.value;
            const fixes = [];
            const additions = [];
            for (const name of missing) {
              const entry = findProperty(paramsObject, name);
              if (!entry) {
                additions.push(`${name}: { dynamic: true }`);
              } else if (entry.value.type === 'ObjectExpression') {
                const dynamic = findProperty(entry.value, 'dynamic');
                if (dynamic) {
                  fixes.push(fixer.replaceText(dynamic.value, 'true'));
                } else {
                  const open = source.getFirstToken(entry.value);
                  fixes.push(
                    fixer.insertTextAfter(
                      open,
                      entry.value.properties.length
                        ? ' dynamic: true,'
                        : ' dynamic: true ',
                    ),
                  );
                }
              } else {
                return null;
              }
            }
            if (additions.length) {
              const open = source.getFirstToken(paramsObject);
              fixes.push(
                fixer.insertTextAfter(
                  open,
                  `\n${additions.join(',\n')}${paramsObject.properties.length ? ',' : ''}`,
                ),
              );
            }
            return fixes;
          },
        });
      },
    };
  },
};
