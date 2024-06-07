import { FunctionComponent } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { isFeatureVisible } from '@waldur/features/connect';
import { UserFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { UserEvents } from '@waldur/user/dashboard/UserEvents';
import { KeysList } from '@waldur/user/keys/KeysList';
import { UserDetailsTable } from '@waldur/user/support/UserDetailsTable';
import { UserEditContainer } from '@waldur/user/support/UserEditContainer';
import { UserOfferingList } from '@waldur/user/UserOfferingList';
import { getUser } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';

import { UserAffiliationsList } from '../affiliations/UserAffiliationsList';

import { UserActivateButton } from './UserActivateButton';

interface UserDetailsDialogProps {
  resolve: { user: UserDetails };
}

export const UserDetailsDialog: FunctionComponent<UserDetailsDialogProps> = ({
  resolve: { user },
}) => {
  const currentUser = useSelector(getUser);
  return (
    <ModalDialog
      title={translate('User details of {fullName}', {
        fullName: user.full_name,
      })}
      footer={
        <div className="flex-grow-1 d-flex justify-content-between">
          <UserActivateButton row={user} />
          <CloseDialogButton label={translate('Done')} />
        </div>
      }
    >
      <Tabs defaultActiveKey={1} unmountOnExit={true}>
        {(currentUser.is_staff || currentUser.is_support) && (
          <Tab eventKey={1} title={translate('Details')}>
            <UserDetailsTable user={user} />
          </Tab>
        )}
        <Tab eventKey={2} title={translate('Audit log')}>
          <UserEvents user={user} hasActionBar={false} />
        </Tab>
        {currentUser.is_staff && (
          <Tab eventKey={3} title={translate('Manage')}>
            <UserEditContainer user={user} showDeleteButton={false} />
          </Tab>
        )}
        {isFeatureVisible(UserFeatures.ssh_keys) ? (
          <Tab eventKey={4} title={translate('Keys')}>
            <KeysList user={user} hasActionBar={false} />
          </Tab>
        ) : null}
        <Tab eventKey={5} title={translate('Remote accounts')}>
          <UserOfferingList user={user} hasActionBar={false} />
        </Tab>
        <Tab eventKey={8} title={translate('Roles and permissions')}>
          <UserAffiliationsList user={user} hasActionBar={false} />
        </Tab>
      </Tabs>
    </ModalDialog>
  );
};
