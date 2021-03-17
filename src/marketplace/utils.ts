import { getFormValues } from 'redux-form';

import { RootState } from '@waldur/store/reducers';

export const getCategoryLink = (projectId, categoryId) => ({
  state: 'marketplace-project-resources',
  params: {
    uuid: projectId,
    category_uuid: categoryId,
  },
});

export const formDataSelector = (state: RootState) =>
  (getFormValues('marketplaceOffering')(state) || {}) as any;

export const formatResourceShort = (resource) => {
  return (
    (resource.name ? resource.name : resource.uuid) +
    ' (' +
    resource.offering_name +
    ')'
  );
};
