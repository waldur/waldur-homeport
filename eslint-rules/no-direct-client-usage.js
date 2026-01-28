/**
 * ESLint rule to prevent direct usage of low-level API client methods.
 * Encourages use of generated SDK functions from 'waldur-js-client'.
 */

const ALLOWED_FILES = [
  'src/administration/api.ts',
  'src/administration/dashboard/AdminStatistics.tsx',
  'src/customer/team/utils.ts',
  'src/form/upload/FileDownloader.tsx',
  'src/form/upload/ImageFetcher.tsx',
  'src/marketplace/common/api.ts',
  'src/marketplace/resources/actions/loadData.tsx',
  'src/navigation/JoinOrganizationFooterLink.tsx',
  'src/navigation/header/ConfirmationDrawerToggle.tsx',
  'src/project/ProjectDashboard.tsx',
  'src/project/team/TeamDropdownActions.tsx',
  'src/proposals/team/AddUserDialog.tsx',
  'src/proposals/team/UserRemoveButton.tsx',
  'src/resource/actions/ActionButtonResource.tsx',
  'src/resource/summary/ResourceSummaryModal.tsx',
  'src/user/affiliations/OrganizationExpandableRow.tsx',
  'src/user/affiliations/ProjectExpandableRow.tsx',
  'src/user/dashboard/UserTosManagement/OfferingTosExpandableRow.tsx',
];

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent direct usage of low-level API client methods',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noDirectClientUsage:
        'Avoid using low-level API methods ({{ method }}) directly. Use generated SDK functions from "waldur-js-client" instead.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();
    const normalizedFilename = filename.replace(/\\/g, '/');

    const isAllowedFile = ALLOWED_FILES.some(
      (allowedPath) =>
        normalizedFilename.includes(allowedPath) ||
        normalizedFilename.endsWith(allowedPath.replace('src/', '')),
    );

    if (isAllowedFile) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        if (node.source.value === '@waldur/core/api') {
          node.specifiers.forEach((specifier) => {
            if (
              specifier.type === 'ImportSpecifier' &&
              ['get', 'post', 'count'].includes(specifier.imported.name)
            ) {
              context.report({
                node: specifier,
                messageId: 'noDirectClientUsage',
                data: {
                  method: specifier.imported.name,
                },
              });
            }
          });
        }
      },
    };
  },
};
