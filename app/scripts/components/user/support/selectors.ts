import { isVisible } from '@waldur/store/config';

export const userManageIsVisible = state => isVisible(state, 'support.user_manage');
export const userDetailsIsVisible = state => isVisible(state, 'support.user_details');
