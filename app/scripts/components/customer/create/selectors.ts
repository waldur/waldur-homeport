import { isVisible } from '@waldur/store/config';

export const getOwnerCanRegisterProvider = state => isVisible(state, 'marketplace');
export const getOwnerCanRegisterExpert = state => isVisible(state, 'experts');
