import { getFormValues } from 'redux-form';

import { isFeatureVisible } from '@waldur/features/connect';
import { RootState } from '@waldur/store/reducers';

export const marketplaceIsVisible = () => isFeatureVisible('marketplace');

export const getCategoryLink = (projectId, categoryId) => ({
  state: 'marketplace-project-resources',
  params: {
    uuid: projectId,
    category_uuid: categoryId,
  },
});

export const formDataSelector = (state: RootState) =>
  (getFormValues('marketplaceOffering')(state) || {}) as any;
