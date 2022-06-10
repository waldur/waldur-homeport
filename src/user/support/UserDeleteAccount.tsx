import React, { useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';

import * as actions from './actions';

interface UserDeleteAccountComponentProps {
  showDeleteButton: boolean;
  showUserRemoval: () => void;
  initial?: boolean;
}

const UserDeleteAccountComponent: React.FC<UserDeleteAccountComponentProps> = (
  props,
) => {
  const [confirm, setConfirm] = useState(false);

  return (
    !props.initial &&
    props.showDeleteButton && (
      <Card>
        <Card.Header className="text-danger">
          {translate('Delete account')}
        </Card.Header>
        <Card.Body>
          <Form.Check
            id="chk-confirm-delete-account"
            type="checkbox"
            checked={confirm}
            onChange={(value) => setConfirm(value.target.checked)}
            label={translate('I confirm my account deletion')}
          />
          <Form.Group>
            <div className="pull-right">
              <Button
                id="remove-btn"
                variant="danger"
                size="sm"
                onClick={props.showUserRemoval}
                disabled={!confirm}
              >
                {translate('Request deletion')}
              </Button>
            </div>
          </Form.Group>
        </Card.Body>
      </Card>
    )
  );
};

UserDeleteAccountComponent.defaultProps = {
  showDeleteButton: true,
};

const mapDispatchToProps = (dispatch) => {
  return {
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

const enhance = compose(connect(null, mapDispatchToProps, mergeProps));

export const UserDeleteAccount = enhance(UserDeleteAccountComponent);
