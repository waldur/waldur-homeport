import { FC, useMemo } from 'react';

import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';

import { UserRolesSummary } from './types';

interface UserRolesSummaryCardsProps {
  summary: UserRolesSummary;
}

export const UserRolesSummaryCards: FC<UserRolesSummaryCardsProps> = ({
  summary,
}) => {
  const stats = useMemo(
    () => [
      {
        label: translate('Organizations'),
        value: summary.totalOrganizations.toLocaleString(),
      },
      {
        label: translate('Total members'),
        value: summary.totalMembers.toLocaleString(),
      },
      {
        label: translate('With resources'),
        value: summary.organizationsWithResources.toLocaleString(),
      },
      {
        label: translate('Avg. members per org'),
        value: summary.averageMembersPerOrg.toLocaleString(),
      },
    ],
    [summary],
  );

  return <SummaryWidget stats={stats} />;
};
