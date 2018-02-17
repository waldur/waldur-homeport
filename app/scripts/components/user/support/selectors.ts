import { isVisible } from '@waldur/store/config';
import { getUser } from '@waldur/workspace/selectors';

export const userManageIsVisible = state => {
  if (!isVisible(state, 'support.user_manage')) {
    return false;
  }
  const user = getUser(state);
  return user.is_staff;
};

export const userEventsIsVisible = state => {
  return isVisible(state, 'support.user_events');
};

export const isVisibleForSupportOrStaff = state => {
  const user = getUser(state);
  return user.is_support || user.is_staff;
};

export const userLanguageIsVisible = state => isVisible(state, 'user.preferred_language');

export const userCompetenceIsVisible = state => isVisible(state, 'user.competence');
