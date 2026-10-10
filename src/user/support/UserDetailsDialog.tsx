import { UserGearIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { User } from 'waldur-js-client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { isFeatureVisible } from '@/features/connect';
import { UserFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { renderFieldOrDash } from '@/table/utils';
import { UserEvents } from '@/user/dashboard/UserEvents';
import { DataAccessDialogContent } from '@/user/data-access/DataAccessDialogContent';
import { KeysList } from '@/user/keys/KeysList';
import { UserDetailsTable } from '@/user/support/UserDetailsTable';
import { UserOfferingList } from '@/user/UserOfferingList';
import { useUser } from '@/workspace/hooks';

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
  const currentUser = useUser() as User;
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
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          message={translate('Unable to load user.')}
          loadData={refetch}
        />
      ) : user ? (
        <Tabs mount="active" defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">{translate('Details')}</TabsTrigger>
            <TabsTrigger value="audit-log">
              {translate('Audit log')}
            </TabsTrigger>
            {isFeatureVisible(UserFeatures.ssh_keys) ? (
              <TabsTrigger value="keys">{translate('Keys')}</TabsTrigger>
            ) : null}
            <TabsTrigger value="remote-accounts">
              {translate('Remote accounts')}
            </TabsTrigger>
            {currentUser.is_staff ||
            currentUser.is_support ||
            currentUser.uuid === user.uuid ? (
              <TabsTrigger value="roles-and-permissions">
                {translate('Roles and permissions')}
              </TabsTrigger>
            ) : null}
            {isFeatureVisible(UserFeatures.show_data_access) &&
              (currentUser.is_staff || currentUser.is_support) && (
                <TabsTrigger value="data-access">
                  {translate('Data access')}
                </TabsTrigger>
              )}
            {isFeatureVisible(UserFeatures.show_identity_bridge) &&
              currentUser.is_staff && (
                <TabsTrigger value="identity-bridge">
                  {translate('Identity Bridge')}
                </TabsTrigger>
              )}
          </TabsList>
          <div className="tab-content">
            <TabsContent value="details">
              <UserDetailsTable user={user} />
            </TabsContent>
            <TabsContent value="audit-log">
              <UserEvents user={user} />
            </TabsContent>
            {isFeatureVisible(UserFeatures.ssh_keys) ? (
              <TabsContent value="keys">
                <KeysList
                  user={user}
                  hasActionBar={false}
                  fullWidth
                  cardBordered={false}
                />
              </TabsContent>
            ) : null}
            <TabsContent value="remote-accounts">
              <UserOfferingList
                user={user}
                hasActionBar={false}
                fullWidth
                cardBordered={false}
              />
            </TabsContent>
            {currentUser.is_staff ||
            currentUser.is_support ||
            currentUser.uuid === user.uuid ? (
              <TabsContent value="roles-and-permissions">
                <UserAffiliationsList
                  user={user}
                  hasActionBar={false}
                  fullWidth
                  cardBordered={false}
                />
              </TabsContent>
            ) : null}
            {isFeatureVisible(UserFeatures.show_data_access) &&
              (currentUser.is_staff || currentUser.is_support) && (
                <TabsContent value="data-access">
                  <DataAccessDialogContent user={user} />
                </TabsContent>
              )}
            {isFeatureVisible(UserFeatures.show_identity_bridge) &&
              currentUser.is_staff && (
                <TabsContent value="identity-bridge">
                  <UserIdentityBridgeTab user={user} />
                </TabsContent>
              )}
          </div>
        </Tabs>
      ) : null}
    </ModalDialog>
  );
};
