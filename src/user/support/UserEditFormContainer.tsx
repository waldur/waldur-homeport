import { connect } from 'react-redux';

import { getNativeNameVisible, getConfig } from '@waldur/store/config';
import {
  fieldIsVisible,
  isRequired,
  isVisibleForSupportOrStaff,
  userTokenIsVisible,
} from '@waldur/user/support/selectors';
import { UserEditForm } from '@waldur/user/support/UserEditForm';
import { getUser } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';

import * as actions from './actions';

const getProtectedMethods = (state: any): string[] => {
  const plugins = getConfig(state).plugins;
  return (
    plugins.WALDUR_CORE.PROTECT_USER_DETAILS_FOR_REGISTRATION_METHODS || []
  );
};

const mapStateToProps = (state, ownProps) => ({
  currentUser: getUser(state) as UserDetails,
  isVisibleForSupportOrStaff: isVisibleForSupportOrStaff(state),
  initialValues: ownProps.user,
  userTokenIsVisible: userTokenIsVisible(state, ownProps),
  fieldIsVisible: fieldIsVisible(ownProps),
  isRequired,
  nativeNameIsVisible: getNativeNameVisible(state),
  fieldIsProtected: (field: string) =>
    ownProps.user.identity_provider_fields.includes(field) ||
    getProtectedMethods(state).includes(ownProps.user.registration_method),
});

const mapDispatchToProps = (dispatch, ownProps) => {
  let updateUser;
  if (ownProps.onSave) {
    updateUser = (data) =>
      ownProps.onSave({
        ...data,
        agree_with_policy: true,
      });
  } else {
    updateUser = (data) =>
      actions.updateUser(
        {
          ...data,
          uuid: ownProps.user.uuid,
          agree_with_policy: true,
        },
        dispatch,
      );
  }

  return {
    updateUser,
  };
};

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const UserEditFormContainer = enhance(UserEditForm);
