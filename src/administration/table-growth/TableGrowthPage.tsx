import { LightningIcon } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { overrideSettingsRetrieve, statsTableGrowth } from 'waldur-js-client';

import { AlertItem, Badge, BaseButton } from 'waldur-ui';

import { STALE_TIME } from '@/core/constants';
import { Link } from '@/core/Link';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { RefreshButton } from '@/marketplace/common/RefreshButton';
import { useNotify } from '@/store/notify';
import { TableWithPortal } from '@/table/types';
import { useUser } from '@/workspace/hooks';

import { TabToolbar } from '../TabToolbar';

import { getTableGrowth } from './api';
import { TableGrowthAlerts } from './TableGrowthAlerts';
import { TableGrowthOverview } from './TableGrowthOverview';
import { TableGrowthTable } from './TableGrowthTable';
import { deriveAlerts } from './utils';

export const TableGrowthPage: FC<Partial<TableWithPortal>> = ({ portal }) => {
  const user = useUser();
  const userIsStaff = user?.is_staff;
  const { showSuccess, showErrorResponse } = useNotify();

  const { data: settings } = useQuery({
    queryKey: ['TableGrowthSettings'],
    queryFn: () => overrideSettingsRetrieve().then((res) => res.data),
    staleTime: STALE_TIME,
  });

  const isEnabled = settings?.TABLE_GROWTH_MONITORING_ENABLED ?? true;

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['TableGrowth'],
    queryFn: getTableGrowth,
    refetchInterval: 60000,
  });

  const alerts = useMemo(() => (data ? deriveAlerts(data) : []), [data]);

  const { mutate: triggerSampling, isPending: isSampling } = useMutation({
    mutationFn: () => statsTableGrowth().then((res) => res.data),
    onSuccess: () => {
      showSuccess(translate('Table size sampling has been scheduled.'));
    },
    onError: (error) => {
      showErrorResponse(error, translate('Failed to trigger sampling.'));
    },
  });

  // The monitoring switch lives on the Settings tab of the same page.
  const monitoringBadge = (
    <Link
      state="admin-database"
      params={{ tab: 'settings' }}
      className="text-decoration-none align-self-center"
    >
      <Badge
        variant={isEnabled ? 'success' : 'warning'}
        shape="pill"
        tone="outline"
      >
        {isEnabled
          ? translate('Monitoring enabled')
          : translate('Monitoring disabled')}
      </Badge>
    </Link>
  );

  if (isLoading || !data) {
    return (
      <div className="pt-5">
        <div className="text-center py-10">
          <LoadingSpinner />
          <p className="text-muted mt-4">
            {translate('Fetching table growth statistics, please standby...')}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return (
      <div className="pt-5">
        <AlertItem
          variant="error"
          title={translate('Failed to load table growth statistics')}
          body={errorMessage}
        />
      </div>
    );
  }

  const panelActions = (
    <>
      {monitoringBadge}
      {userIsStaff && (
        <BaseButton
          pending={isSampling}
          variant="tertiary"
          className="min-w-100px"
          onClick={() => triggerSampling()}
          label={translate('Sample now')}
          iconNode={<LightningIcon weight="bold" />}
          size="lg"
        />
      )}
      <RefreshButton refetch={refetch} isLoading={isRefetching} />
    </>
  );

  return (
    <div className="pt-5">
      <TabToolbar portal={portal}>{panelActions}</TabToolbar>
      <TableGrowthOverview data={data} alerts={alerts} />
      <TableGrowthAlerts alerts={alerts} />
      <TableGrowthTable data={data} alerts={alerts} />
    </div>
  );
};
