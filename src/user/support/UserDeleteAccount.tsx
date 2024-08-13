import { Trash } from '@phosphor-icons/react';
import { FC, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { openIssueCreateDialog } from '@waldur/issues/create/actions';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { openModalDialog } from '@waldur/modal/actions';
import { UserDetails } from '@waldur/workspace/types';

const UserRemovalMessageDialog = lazyComponent(
  () => import('./UserRemovalMessageDialog'),
  'UserRemovalMessageDialog',
);

export const UserDeleteAccount: FC<{ user: UserDetails }> = ({ user }) => {
  const dispatch = useDispatch();
  const [confirm, setConfirm] = useState(false);
  const showUserRemoval = () => {
    if (ENV.plugins.WALDUR_SUPPORT.ENABLED) {
      dispatch(
        openIssueCreateDialog({
          issue: {
            type: ISSUE_IDS.CHANGE_REQUEST,
            summary: translate('Account deletion'),
          },
          options: {
            title: translate('Account deletion'),
            hideTitle: true,
            descriptionPlaceholder: translate(
              'Why would you want to go away? Help us become better please!',
            ),
            descriptionLabel: translate('Reason'),
            submitTitle: translate('Request deletion'),
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
    <Panel
      title={translate('Delete account')}
      className="card-bordered"
      actions={
        <Button
          variant="light-danger"
          onClick={showUserRemoval}
          disabled={!confirm}
        >
          <span className="svg-icon svg-icon-2">
            <Trash weight="bold" />
          </span>
          {translate('Request deletion')}
        </Button>
      }
    >
      <ul className="text-grey-500 mb-7">
        <li>{translate('Permanently delete your account.')}</li>
        <li>{translate('This action cannot be undone.')}</li>
      </ul>
      <Form.Check
        id="confirm-deletion"
        type="checkbox"
        checked={confirm}
        onChange={(value) => setConfirm(value.target.checked)}
        label={translate(
          'I confirm that I understand the impact and want to delete my account',
        )}
      />
    </Panel>
  );
};
