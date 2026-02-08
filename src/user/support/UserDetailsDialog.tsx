import { UserGearIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { User } from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { isFeatureVisible } from '@waldur/features/connect';
import { UserFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { renderFieldOrDash } from '@waldur/table/utils';
import { UserEvents } from '@waldur/user/dashboard/UserEvents';
import { DataAccessDialogContent } from '@waldur/user/data-access/DataAccessDialogContent';
import { KeysList } from '@waldur/user/keys/KeysList';
import { UserDetailsTable } from '@waldur/user/support/UserDetailsTable';
import { UserOfferingList } from '@waldur/user/UserOfferingList';
import { getUser } from '@waldur/workspace/selectors';

import { UserAffiliationsList } from '../affiliations/UserAffiliationsList';

import { UserIdentityBridgeTab } from './UserIdentityBridgeTab';

interface UserDetailsDialogProps {
  resolve: {
    user: User;
    loading?: boolean;
    error?;
    refetch?;
  };
}

export const UserDetailsDialog: FunctionComponent<UserDetailsDialogProps> = ({
  resolve: { user, loading, error, refetch },
}) => {
  const currentUser = useSelector(getUser) as User;
  return (
    <ModalDialog
      title={translate('User details of {fullName}', {
        fullName: renderFieldOrDash(user?.full_name),
      })}
      subtitle={translate(
        'View detailed information about a user, including its permissions and contact details',
      )}
      iconNode={<UserGearIcon weight="bold" />}
      iconColor="success"
      bodyClassName="h-425px"
      closeButton
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          message={translate('Unable to load user.')}
          loadData={refetch}
        />
      ) : user ? (
        <Tabs
          defaultActiveKey={1}
          unmountOnExit={true}
          className="nav-line-tabs mb-4"
        >
          <Tab eventKey={1} title={translate('Details')}>
            <UserDetailsTable user={user} />
          </Tab>
          <Tab eventKey={3} title={translate('Audit log')}>
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
          {currentUser.is_staff ||
          currentUser.is_support ||
          currentUser.uuid === user.uuid ? (
            <Tab eventKey={6} title={translate('Roles and permissions')}>
              <UserAffiliationsList user={user} hasActionBar={false} />
            </Tab>
          ) : null}
          {isFeatureVisible(UserFeatures.show_data_access) &&
            (currentUser.is_staff || currentUser.is_support) && (
              <Tab eventKey={7} title={translate('Data access')}>
                <DataAccessDialogContent user={user} />
              </Tab>
            )}
          {isFeatureVisible(UserFeatures.show_identity_bridge) &&
            currentUser.is_staff && (
              <Tab eventKey={8} title={translate('Identity Bridge')}>
                <UserIdentityBridgeTab user={user} />
              </Tab>
            )}
        </Tabs>
      ) : null}
    </ModalDialog>
  );
};
