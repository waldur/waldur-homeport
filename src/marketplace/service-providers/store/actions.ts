import { openModalDialog } from '@waldur/modal/actions';

import * as constants from './constants';

export const showSecretCodeRegenerateConfirm = serviceProvider =>
  openModalDialog('MarketplaceServiceProviderSecretCodeGenerateConfirm', {
    resolve: { serviceProvider },
    size: 'md',
  });

export const secretCodeRegenerateStart = serviceProvider => ({
  type: constants.SERVICE_PROVIDER_CODE_REGENERATE_START,
  payload: {
    serviceProvider,
  },
});

export const secretCodeRegenerateSuccess = code => ({
  type: constants.SERVICE_PROVIDER_CODE_REGENERATE_SUCCESS,
  payload: {
    code,
  },
});

export const secretCodeRegenerateError = () => ({
  type: constants.SERVICE_PROVIDER_CODE_REGENERATE_ERROR,
});

export const secretCodeFetchStart = serviceProvider => ({
  type: constants.SERVICE_PROVIDER_CODE_FETCH_START,
  payload: {
    serviceProvider,
  },
});

export const secretCodeFetchSuccess = code => ({
  type: constants.SERVICE_PROVIDER_CODE_FETCH_SUCCESS,
  payload: {
    code,
  },
});
