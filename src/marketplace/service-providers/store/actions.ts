import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const ServiceProviderSecretCodeGenerateConfirm = lazyComponent(
  () => import('../ServiceProviderSecretCodeGenerateConfirm'),
  'ServiceProviderSecretCodeGenerateConfirm',
);

import * as constants from './constants';

export const showSecretCodeRegenerateConfirm = (serviceProvider) =>
  openModalDialog(ServiceProviderSecretCodeGenerateConfirm, {
    resolve: { serviceProvider },
    size: 'lg',
  });

export const secretCodeRegenerateStart = (serviceProvider) => ({
  type: constants.SERVICE_PROVIDER_CODE_REGENERATE_START,
  payload: {
    serviceProvider,
  },
});

export const secretCodeRegenerateSuccess = (code) => ({
  type: constants.SERVICE_PROVIDER_CODE_REGENERATE_SUCCESS,
  payload: {
    code,
  },
});

export const secretCodeRegenerateError = () => ({
  type: constants.SERVICE_PROVIDER_CODE_REGENERATE_ERROR,
});

export const secretCodeFetchStart = (serviceProvider) => ({
  type: constants.SERVICE_PROVIDER_CODE_FETCH_START,
  payload: {
    serviceProvider,
  },
});

export const secretCodeFetchSuccess = (code) => ({
  type: constants.SERVICE_PROVIDER_CODE_FETCH_SUCCESS,
  payload: {
    code,
  },
});
