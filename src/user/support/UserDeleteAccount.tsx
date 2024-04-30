import { FC, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openIssueCreateDialog } from '@waldur/issues/create/actions';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { openModalDialog } from '@waldur/modal/actions';

const UserRemovalMessageDialog = lazyComponent(
  () => import('./UserRemovalMessageDialog'),
  'UserRemovalMessageDialog',
);

export const UserDeleteAccount: FC<{ user }> = ({ user }) => {
  const dispatch = useDispatch();
  const [confirm, setConfirm] = useState(false);
  const showUserRemoval = () => {
    if (ENV.plugins.WALDUR_SUPPORT.ENABLED) {
      dispatch(
        openIssueCreateDialog({
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
        }),
      );
    } else {
      dispatch(
        openModalDialog(UserRemovalMessageDialog, {
          resolve: {
            supportEmail: ENV.plugins.WALDUR_CORE.SITE_EMAIL,
            userName: user.full_name,
          },
        }),
      );
    }
  };

  return (
    <Card>
      <Card.Header className="text-danger">
        {translate('Delete account')}
      </Card.Header>
      <Card.Body className="d-flex justify-content-between">
        <Form.Check
          type="checkbox"
          checked={confirm}
          onChange={(value) => setConfirm(value.target.checked)}
          label={translate('I confirm my account deletion')}
        />
        <Button
          variant="danger"
          size="sm"
          onClick={showUserRemoval}
          disabled={!confirm}
        >
          {translate('Request deletion')}
        </Button>
      </Card.Body>
    </Card>
  );
};
