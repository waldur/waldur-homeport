import { ENV } from '@waldur/configs/default';
import { UserFeatures } from '@waldur/FeaturesEnums';
import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';
import { getUser } from '@waldur/workspace/selectors';

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
  isVisible(state, UserFeatures.preferred_language);
