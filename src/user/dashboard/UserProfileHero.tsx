import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC, useMemo } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { User } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { isDescendantOf } from '@/navigation/useTabs';

import { UsersService } from '../UsersService';

import { UserProfile } from './UserProfile';

interface UserProfileHeroProps {
  user: User;
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
      (user &&
        !UsersService.mandatoryFieldsMissing(user) &&
        Boolean(user.agreement_date)) ||
      user?.is_staff,
    [user],
  );

  const showViewTab = isDescendantOf('profile', state);

  const disabledReason = !user?.agreement_date
    ? translate('Terms of service not accepted')
    : translate('Profile is incomplete');

  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <LoadingErred loadData={refetch} />
  ) : (
    <div className="container-fluid my-5">
      <Tab.Container
        defaultActiveKey={
          state.name === 'profile-manage' || !showViewTab
            ? 'profile-manage'
            : 'profile.details'
        }
        onSelect={showViewTab ? goTo : null}
      >
        <Nav variant="tabs" className="nav-line-tabs mb-4">
          {showViewTab && (
            <Nav.Item>
              {isValidUser ? (
                <Nav.Link
                  eventKey="profile.details"
                  className="text-center min-w-60px"
                >
                  {translate('View')}
                </Nav.Link>
              ) : (
                // The tooltip has to wrap the link from the outside: a
                // disabled nav link stops receiving hover, so a tooltip
                // nested inside it would never open. Same arrangement as the
                // draft-offering tab in OfferingViewHero.
                <Tip id="tip-profile-view-disabled" label={disabledReason}>
                  <Nav.Link disabled className="text-center min-w-60px">
                    {translate('View')}
                  </Nav.Link>
                </Tip>
              )}
            </Nav.Item>
          )}
          <Nav.Item>
            <Nav.Link
              eventKey="profile-manage"
              className="text-center min-w-60px"
            >
              {translate('Edit')}
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Tab.Container>
      <UserProfile user={user} />
    </div>
  );
};
