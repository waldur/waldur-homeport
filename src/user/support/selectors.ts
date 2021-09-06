import { ENV } from '@waldur/configs/default';
import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';
import { getUser } from '@waldur/workspace/selectors';

export const userManageIsVisible = (state: RootState) => {
  if (!isVisible(state, 'support.user_manage')) {
    return false;
  }
  const user = getUser(state);
  return user.is_staff;
};

export const userTokenIsVisible = (state: RootState, ownProps) => {
  const currentUser = getUser(state);
  if (!currentUser) {
    return false;
  }
  if (currentUser.uuid !== ownProps.user.uuid) {
    return false;
  }
  return ownProps.user.token && !ownProps.initial;
};

export const fieldIsVisible = (ownProps) => (field: string) => {
  if (!ownProps.initial) {
    return true;
  }

  return !ENV.plugins.WALDUR_CORE.USER_REGISTRATION_HIDDEN_FIELDS.includes(
    field,
  );
};

export const isRequired = (field: string) => {
  return ENV.plugins.WALDUR_CORE.USER_MANDATORY_FIELDS.includes(field);
};

export const isVisibleForSupportOrStaff = (state: RootState) => {
  const user = getUser(state);
  return user && (user.is_support || user.is_staff);
};

export const userLanguageIsVisible = (state: RootState) =>
  isVisible(state, 'user.preferred_language');

export const userCompetenceIsVisible = (state: RootState) =>
  isVisible(state, 'user.competence');
