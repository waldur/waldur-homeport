import { ENV } from '@waldur/core/services';
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

export const userTokenIsVisible = (state, ownProps) => {
  const currentUser = getUser(state);
  if (currentUser.uuid !== ownProps.user.uuid) {
    return false;
  }
  return ownProps.user.token && !ownProps.initial;
};

export const fieldIsVisible = ownProps => (field: string) => {
  if (!ownProps.initial) {
    return true;
  }

  return ENV.userRegistrationHiddenFields.indexOf(field) === -1;
};

export const nativeNameIsVisible = () => {
  return ENV.plugins.WALDUR_CORE.NATIVE_NAME_ENABLED === true;
};

export const isRequired = (field: string) => {
  return ENV.userMandatoryFields.indexOf(field) !== -1;
};

export const isVisibleForSupportOrStaff = state => {
  const user = getUser(state);
  return user.is_support || user.is_staff;
};

export const userLanguageIsVisible = state => isVisible(state, 'user.preferred_language');

export const userCompetenceIsVisible = state => isVisible(state, 'user.competence');
