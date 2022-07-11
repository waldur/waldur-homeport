import React from 'react';
import { connect } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { getNativeNameVisible, getConfig } from '@waldur/store/config';
import {
  fieldIsVisible,
  isRequired,
  isVisibleForSupportOrStaff,
  userTokenIsVisible,
} from '@waldur/user/support/selectors';
import { UserEditForm } from '@waldur/user/support/UserEditForm';
import { UserDetails } from '@waldur/workspace/types';

import '../user-edit.scss';
import * as actions from './actions';
import { EmailChangeForm } from './EmailChangeForm';

interface UserUpdateComponentProps {
  showDeleteButton: boolean;
  user: UserDetails;
}

const UserUpdateComponent: React.FC<UserUpdateComponentProps> = (props) => {
  if (!props.user.email) {
    return <EmailChangeForm user={props.user} />;
  }
  return <UserEditForm {...props} />;
};

UserUpdateComponent.defaultProps = {
  showDeleteButton: true,
};

const getProtectedMethods = (state: any): string[] => {
  const plugins = getConfig(state).plugins;
  return (
    plugins.WALDUR_CORE.PROTECT_USER_DETAILS_FOR_REGISTRATION_METHODS || []
  );
};

const mapStateToProps = (state, ownProps: { user: UserDetails }) => ({
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
    dispatchRemoval: () => dispatch(actions.showUserRemoval()),
    dispatchMessage: (resolve) =>
      dispatch(actions.showUserRemovalMessage(resolve)),
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { user } = ownProps;
  const { dispatchRemoval, dispatchMessage } = dispatchProps;
  let showUserRemoval;

  if (ENV.plugins.WALDUR_SUPPORT) {
    showUserRemoval = dispatchRemoval;
  } else {
    showUserRemoval = () =>
      dispatchMessage({
        supportEmail: ENV.plugins.WALDUR_CORE.SITE_EMAIL,
        userName: user.full_name,
      });
  }

  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    showUserRemoval,
  };
};

const enhance = connect(mapStateToProps, mapDispatchToProps, mergeProps);

export const UserEditContainer = enhance(UserUpdateComponent);
