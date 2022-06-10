import React from 'react';
import { Card } from 'react-bootstrap';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { getNativeNameVisible, getConfig } from '@waldur/store/config';
import {
  fieldIsVisible,
  isRequired,
  isVisibleForSupportOrStaff,
} from '@waldur/user/support/selectors';
import { UserEditForm } from '@waldur/user/support/UserEditForm';
import { UserDetails } from '@waldur/workspace/types';

import * as actions from './actions';
import { EmailChangeForm } from './EmailChangeForm';

interface UserUpdateComponentProps {
  user: UserDetails;
}

const UserUpdateComponent: React.FC<UserUpdateComponentProps> = (props) => {
  return (
    <Card className="user-edit mb-6">
      <Card.Header>{translate('Profile settings')}</Card.Header>
      <Card.Body>
        {!props.user.email ? (
          <EmailChangeForm user={props.user} />
        ) : (
          <UserEditForm {...props} />
        )}
      </Card.Body>
    </Card>
  );
};

const getProtectedMethods = (state: any): string[] => {
  const plugins = getConfig(state).plugins;
  return (
    plugins.WALDUR_CORE.PROTECT_USER_DETAILS_FOR_REGISTRATION_METHODS || []
  );
};

const mapStateToProps = (state, ownProps) => ({
  isVisibleForSupportOrStaff: isVisibleForSupportOrStaff(state),
  initialValues: ownProps.user,
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

const enhance = connect(mapStateToProps, mapDispatchToProps, null);

export const UserEditFormContainer = enhance(UserUpdateComponent);
