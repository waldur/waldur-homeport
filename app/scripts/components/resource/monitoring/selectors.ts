import { isVisible } from '@waldur/store/config';

export const getMonitoringState = state => state.monitoring;
export const monitoringIsVisible = state => isVisible(state, 'monitoring');
