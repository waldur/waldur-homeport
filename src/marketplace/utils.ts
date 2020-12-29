import { getFormValues } from 'redux-form';

import { isFeatureVisible } from '@waldur/features/connect';

export const marketplaceIsVisible = () => isFeatureVisible('marketplace');

export const getCategoryLink = (projectId, categoryId) => ({
  state: 'marketplace-project-resources',
  params: {
    uuid: projectId,
    category_uuid: categoryId,
  },
});

export const formDataSelector = (state) =>
  (getFormValues('marketplaceOffering')(state) || {}) as any;
