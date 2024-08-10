import { UserGear } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { isFeatureVisible } from '@waldur/features/connect';
import { UserFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';
import { UserEvents } from '@waldur/user/dashboard/UserEvents';
import { KeysList } from '@waldur/user/keys/KeysList';
import { UserDetailsTable } from '@waldur/user/support/UserDetailsTable';
import { UserOfferingList } from '@waldur/user/UserOfferingList';
import { getUser } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';

import { UserAffiliationsList } from '../affiliations/UserAffiliationsList';

interface UserDetailsDialogProps {
  resolve: { user: UserDetails };
}

export const UserDetailsDialog: FunctionComponent<UserDetailsDialogProps> = ({
  resolve: { user },
}) => {
  const currentUser = useSelector(getUser);
  return (
    <MetronicModalDialog
      title={translate('User details of {fullName}', {
        fullName: user.full_name,
      })}
      subtitle={translate(
        'View detailed information about a user, including its permissions and contact details',
      )}
      iconNode={<UserGear weight="bold" />}
      iconColor="success"
      bodyClassName="min-h-350px"
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      <Tabs
        defaultActiveKey={1}
        unmountOnExit={true}
        className="nav-line-tabs mb-4"
      >
        {(currentUser.is_staff || currentUser.is_support) && (
          <Tab eventKey={1} title={translate('Details')}>
            <UserDetailsTable user={user} />
          </Tab>
        )}
        <Tab eventKey={2} title={translate('Audit log')}>
          <UserEvents user={user} hasActionBar={false} />
        </Tab>
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
    </MetronicModalDialog>
  );
};
