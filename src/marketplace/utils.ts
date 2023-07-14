import ipRegex from 'ip-regex';
import { getFormValues } from 'redux-form';

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

export const isExperimentalUiComponentsVisible = () =>
  isFeatureVisible('marketplace.show_experimental_ui_components');

const IPv4_ADDRESS_PATTERN = ipRegex.v4({ exact: true });
const IPv6_ADDRESS_PATTERN = ipRegex.v6({ exact: true });

export const validateIP = (value) => {
  if (!value) return false;
  return IPv4_ADDRESS_PATTERN.test(value) || IPv6_ADDRESS_PATTERN.test(value);
};
