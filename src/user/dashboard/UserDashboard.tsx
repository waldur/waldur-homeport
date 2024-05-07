import { FC } from 'react';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { countChecklists } from '@waldur/marketplace-checklist/api';
import { getUser } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';

import { UserAffiliationsList } from '../affiliations/UserAffiliationsList';

import { UserDashboardChart } from './UserDashboardChart';
import { UserProfile } from './UserProfile';
import { UserWelcome } from './UserWelcome';

export const UserDashboard: FC = () => {
  const user = useSelector(getUser) as UserDetails;

  const asyncState = useAsync(countChecklists);

  return !user || asyncState.loading ? (
    <LoadingSpinner />
  ) : asyncState.error ? (
    <>{translate('Unable to load data.')}</>
  ) : (
    <>
      <UserWelcome user={user} />
      <UserProfile user={user} />
      <UserDashboardChart user={user} hasChecklists={asyncState.value > 0} />
      <UserAffiliationsList />
    </>
  );
};
