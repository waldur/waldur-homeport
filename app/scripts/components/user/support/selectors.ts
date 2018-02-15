import { isVisible } from '@waldur/store/config';
import { getUser } from '@waldur/workspace/selectors';

export const userManageIsVisible = state => {
  if (!isVisible(state, 'support.user_manage')) {
    return false;
  }
  const user = getUser(state);
  return user.is_staff && !user.is_support;
};

export const userDetailsIsVisible = state => {
  if (!isVisible(state, 'support.user_details')) {
    return false;
  }
  const user = getUser(state);
  return user.is_support && !user.is_staff;
};

export const userStatusIsVisible = state => {
  const user = getUser(state);
  return user.is_staff || user.is_support;
};

export const userLanguageIsVisible = state => isVisible(state, 'user.preferred_language');

export const userCompetenceIsVisible = state => isVisible(state, 'user.competence');
