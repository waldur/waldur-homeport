import { isVisible } from '@waldur/store/config';

export const getMonitoringState = state => state.resource.monitoring;
export const monitoringIsVisible = state => isVisible(state, 'monitoring');
