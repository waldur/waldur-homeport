import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC, useMemo } from 'react';
import { Tab, Tabs } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import { UserDetails } from '@waldur/workspace/types';

import { UsersService } from '../UsersService';

import { UserProfile } from './UserProfile';

interface UserProfileHeroProps {
  user: UserDetails;
  refetch?;
  isLoading?;
  error?;
}

export const UserProfileHero: FC<UserProfileHeroProps> = ({
  user,
  refetch,
  isLoading,
  error,
}) => {
  const { state } = useCurrentStateAndParams();
  const router = useRouter();
  const goTo = (stateName) => router.stateService.go(stateName);

  const isValidUser = useMemo(
    () =>
      user &&
      !UsersService.mandatoryFieldsMissing(user) &&
      Boolean(user.agreement_date),
    [user],
  );

  const showViewTab = isDescendantOf('profile', state);

  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <LoadingErred loadData={refetch} />
  ) : (
    <div className="container-fluid mb-8 mt-6">
      <Tabs
        defaultActiveKey={
          state.name === 'profile-manage' || !showViewTab
            ? 'profile-manage'
            : 'profile.details'
        }
        className="nav-line-tabs mb-4"
        onSelect={showViewTab ? goTo : null}
      >
        {showViewTab && (
          <Tab
            eventKey="profile.details"
            title={translate('View')}
            disabled={!isValidUser}
            tabClassName={
              'text-center w-60px' + (isValidUser ? '' : ' opacity-50')
            }
          />
        )}
        <Tab
          eventKey="profile-manage"
          title={translate('Edit')}
          tabClassName="text-center w-60px"
        />
      </Tabs>
      <UserProfile user={user} />
    </div>
  );
};
