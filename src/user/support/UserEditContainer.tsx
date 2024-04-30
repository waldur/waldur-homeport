import { FC } from 'react';
import { connect } from 'react-redux';

import { getNativeNameVisible, getConfig } from '@waldur/store/config';
import {
  fieldIsVisible,
  isRequired,
  isVisibleForSupportOrStaff,
  userTokenIsVisible,
} from '@waldur/user/support/selectors';
import { UserEditForm } from '@waldur/user/support/UserEditForm';
import { UserDetails } from '@waldur/workspace/types';

import * as actions from './actions';
import { EmailChangeForm } from './EmailChangeForm';

interface OwnProps {
  user: UserDetails;
}

const UserUpdateComponent: FC<
  OwnProps &
    ReturnType<typeof mapStateToProps> &
    ReturnType<typeof mapDispatchToProps>
> = (props) => {
  if (!props.user.email) {
    return <EmailChangeForm user={props.user} />;
  }
  return <UserEditForm {...props} />;
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
  };
};

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const UserEditContainer = enhance(UserUpdateComponent);
