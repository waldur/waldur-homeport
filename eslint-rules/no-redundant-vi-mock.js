export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow redundant vi.mock calls for modules that are globally mocked.',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      redundantMock: 'The module "{{moduleName}}" is already mocked globally in test/setupTests.js. Local vi.mock() is redundant.',
    },
  },
  create(context) {
    const globallyMockedModules = [
      'waldur-js-client',
      '@uirouter/react',
      '@/router',
      '@phosphor-icons/react',
      '@/modal/actions',
      '@/store/notify',
      '@/workspace/hooks',
      '@/i18n/LanguageUtilsService',
      '@monaco-editor/react',
      '@/form/monacoSetup',
      '@/core/config',
      '@/core/EChart',
      '@/form/MarkdownEditor',
      '@/form/DateField',
    ];

    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'vi' &&
          node.callee.property.name === 'mock' &&
          node.arguments.length > 0 &&
          node.arguments[0].type === 'Literal' &&
          globallyMockedModules.includes(node.arguments[0].value)
        ) {
          // If it only has one argument, it's definitely redundant
          // If it has a factory (2nd argument), it might be intentional, but usually it's better to avoid it if possible.
          // The request specifically mentions vi.mock('waldur-js-client') which usually has one arg.
          
          context.report({
            node,
            messageId: 'redundantMock',
            data: {
              moduleName: node.arguments[0].value,
            },
            fix(fixer) {
              // Only auto-fix if it has 1 argument
              if (node.arguments.length === 1) {
                return fixer.remove(node);
              }
              return null;
            },
          });
        }
      },
    };
  },
};
