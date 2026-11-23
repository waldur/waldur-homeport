/**
 * The initializer of a `const` an identifier refers to, when it is declared in
 * a scope the identifier can see: `const FMT = 'MMM yyyy'; d.toFormat(FMT)`.
 * Returns the node itself for anything else, so callers can inspect what
 * they were given either way.
 */
export const resolveConst = (context, node) => {
  if (node?.type !== 'Identifier') return node;
  let scope = context.sourceCode.getScope(node);
  while (scope) {
    const variable = scope.set.get(node.name);
    if (variable) {
      const def = variable.defs[0];
      if (
        def?.type === 'Variable' &&
        def.parent?.kind === 'const' &&
        def.node.init
      ) {
        return def.node.init;
      }
      return node;
    }
    scope = scope.upper;
  }
  return node;
};
