import * as React from 'react';
import * as Gravatar from 'react-gravatar';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { ENV } from '@waldur/core/services';
import { translate, withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';
import {
  fieldIsVisible,
  isRequired,
  isVisibleForSupportOrStaff,
  isVisibleSupport,
  nativeNameIsVisible,
  userTokenIsVisible
} from '@waldur/user/support/selectors';
import { UserEditForm } from '@waldur/user/support/UserEditForm';
import { UserDetails } from '@waldur/workspace/types';

import '../user-edit.scss';
import * as actions from './actions';

interface UserUpdateComponentProps {
  showDeleteButton: boolean;
  user: UserDetails;
}

const UserUpdateComponent: React.SFC<UserUpdateComponentProps> = props => {
  return (
    <div className="row">
      <div className="col-sm-2 col-xs-12 user-edit">
        <div className="logo">
          <div className="img-wrapper">
            <Gravatar email={props.user.email} size={100} />
          </div>
          <span className="manage-gravatar">
            {translate('Manage at')}<br />
            <a href="https://gravatar.com" target="_blank">gravatar.com</a>
          </span>
        </div>
      </div>
      <UserEditForm {...props} />
    </div>
  );
};

UserUpdateComponent.defaultProps = {
  showDeleteButton: true,
};

const mapStateToProps = (state, ownProps) => ({
  isVisibleForSupportOrStaff: isVisibleForSupportOrStaff(state),
  isVisibleSupportFeature: isVisibleSupport(state),
  initialValues: ownProps.user,
  userTokenIsVisible: userTokenIsVisible(state, ownProps),
  fieldIsVisible: fieldIsVisible(ownProps),
  isRequired,
  nativeNameIsVisible: nativeNameIsVisible(),
});

const mapDispatchToProps = (dispatch, ownProps) => {
  let updateUser;
  if (ownProps.onSave) {
    updateUser = data => ownProps.onSave({
      ...data,
      agree_with_policy: true,
    });
  } else {
    updateUser = data => actions.updateUser({
      ...data,
      uuid: ownProps.user.uuid,
      agree_with_policy: true,
    }, dispatch);
  }

  return {
    updateUser,
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { isVisibleSupportFeature } = stateProps;
  const { user, dispatch } = ownProps;
  let showUserRemoval;

  if (isVisibleSupportFeature) {
    showUserRemoval = () => dispatch(actions.showUserRemoval());
  } else {
    const resolve = {
      supportEmail: ENV.supportEmail,
      userName: user.full_name,
    };
    showUserRemoval = () => dispatch(actions.showUserRemovalMessage(resolve));
  }

  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    showUserRemoval,
  };
};

const enhance = compose(
  withTranslation,
  connect(mapStateToProps, mapDispatchToProps, mergeProps),
);

export const UserEditContainer = enhance(UserUpdateComponent);

export default connectAngularComponent(UserEditContainer, ['user', 'initial', 'onSave']);
