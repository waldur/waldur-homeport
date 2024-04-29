import React, { useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openIssueCreateDialog } from '@waldur/issues/create/actions';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { openModalDialog } from '@waldur/modal/actions';

interface UserDeleteAccountComponentProps {
  showUserRemoval: () => void;
}

const UserRemovalMessageDialog = lazyComponent(
  () => import('./UserRemovalMessageDialog'),
  'UserRemovalMessageDialog',
);

const showUserRemoval = () => {
  const resolve = {
    issue: {
      type: ISSUE_IDS.CHANGE_REQUEST,
      summary: translate('Account removal'),
    },
    options: {
      title: translate('Account removal'),
      hideTitle: true,
      descriptionPlaceholder: translate(
        'Why would you want to go away? Help us become better please!',
      ),
      descriptionLabel: translate('Reason'),
      submitTitle: translate('Request removal'),
    },
    hideProjectAndResourceFields: true,
    standaloneTicket: true,
  };
  return openIssueCreateDialog(resolve);
};

const UserDeleteAccountComponent: React.FC<UserDeleteAccountComponentProps> = (
  props,
) => {
  const [confirm, setConfirm] = useState(false);

  return (
    <Card>
      <Card.Header className="text-danger">
        {translate('Delete account')}
      </Card.Header>
      <Card.Body className="d-flex justify-content-between">
        <Form.Check
          id="chk-confirm-delete-account"
          type="checkbox"
          checked={confirm}
          onChange={(value) => setConfirm(value.target.checked)}
          label={translate('I confirm my account deletion')}
        />
        <Button
          id="remove-btn"
          variant="danger"
          size="sm"
          onClick={props.showUserRemoval}
          disabled={!confirm}
        >
          {translate('Request deletion')}
        </Button>
      </Card.Body>
    </Card>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatchRemoval: () => dispatch(showUserRemoval()),
    dispatchMessage: (resolve) =>
      dispatch(openModalDialog(UserRemovalMessageDialog, { resolve })),
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { user } = ownProps;
  const { dispatchRemoval, dispatchMessage } = dispatchProps;
  let showUserRemoval;

  if (ENV.plugins.WALDUR_SUPPORT.ENABLED) {
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
