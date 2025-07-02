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
import { UserChecklist } from '@waldur/marketplace-checklist/UserChecklist';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { renderFieldOrDash } from '@waldur/table/utils';
import { UserEvents } from '@waldur/user/dashboard/UserEvents';
import { KeysList } from '@waldur/user/keys/KeysList';
import { UserDetailsTable } from '@waldur/user/support/UserDetailsTable';
import { UserOfferingList } from '@waldur/user/UserOfferingList';
import { getUser } from '@waldur/workspace/selectors';

import { UserAffiliationsList } from '../affiliations/UserAffiliationsList';

interface UserDetailsDialogProps {
  resolve: {
    user: User;
    showChecklists?: boolean;
    loading?: boolean;
    error?;
    refetch?;
  };
}

export const UserDetailsDialog: FunctionComponent<UserDetailsDialogProps> = ({
  resolve: { user, showChecklists, loading, error, refetch },
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
      bodyClassName="min-h-425px"
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
          {showChecklists ? (
            <Tab eventKey={2} title={translate('Checklists')}>
              <UserChecklist userId={user.uuid} readOnly={true} />
            </Tab>
          ) : null}
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
        </Tabs>
      ) : null}
    </ModalDialog>
  );
};
