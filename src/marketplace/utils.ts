import { getFormValues } from 'redux-form';

import { formatErrorObject } from '@waldur/core/ErrorMessageFormatter';
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

export const handleMarketplaceErrorResponse = (
  response,
  message: string,
): string => {
  if (response.data.components && Array.isArray(response.data.components)) {
    message +=
      ' ' +
      response.data.components
        .map((component) => {
          if (typeof component === 'object') {
            return formatErrorObject(component);
          } else {
            return component;
          }
        })
        .join('. ');
  }
  return message;
};
