import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';

export const getMonitoringState = (state: RootState) =>
  state.resource.monitoring;
export const monitoringIsVisible = (state: RootState) =>
  isVisible(state, 'monitoring');
