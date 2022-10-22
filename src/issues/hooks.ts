import { getConfig } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';

export const hasSupport = (state: RootState) =>
  !!getConfig(state).plugins.WALDUR_SUPPORT;
