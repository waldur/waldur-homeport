import { translate } from '@waldur/i18n';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';

export const getOrganizationWorkspaceBreadcrumb = (): BreadcrumbItem[] => [
  {
    label: translate('Organization workspace'),
    state: 'organization.details',
  },
];
