import ipRegex from 'ip-regex';
import { getFormValues } from 'redux-form';

import { formatErrorObject } from '@waldur/core/ErrorMessageFormatter';
import { isFeatureVisible } from '@waldur/features/connect';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { RootState } from '@waldur/store/reducers';

export const formDataSelector = (state: RootState) =>
  (getFormValues(FORM_ID)(state) || {}) as any;

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

export const isExperimentalUiComponentsVisible = () =>
  isFeatureVisible('marketplace.show_experimental_ui_components');

const IPv4_ADDRESS_PATTERN = ipRegex.v4({ exact: true });
const IPv6_ADDRESS_PATTERN = ipRegex.v6({ exact: true });

export const validateIP = (value) => {
  if (!value) return false;
  return IPv4_ADDRESS_PATTERN.test(value) || IPv6_ADDRESS_PATTERN.test(value);
};
