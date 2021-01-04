import { RootState } from '@waldur/store/reducers';

export const getServiceProviderSecretCode = (state: RootState) =>
  state.marketplace.serviceProvider.secretCode;
