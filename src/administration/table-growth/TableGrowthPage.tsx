import { LightningIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { overrideSettingsRetrieve, statsTableGrowth } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { STALE_TIME } from '@/core/constants';
import { Link } from '@/core/Link';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { RefreshButton } from '@/marketplace/common/RefreshButton';
import { useNotify } from '@/store/notify';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

import { getTableGrowth } from './api';
import { TableGrowthAlerts } from './TableGrowthAlerts';
import { TableGrowthOverview } from './TableGrowthOverview';
import { TableGrowthTable } from './TableGrowthTable';
import { deriveAlerts } from './utils';

export const TableGrowthPage = () => {
  const userIsStaff = useSelector(isStaffSelector);
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

  const panelTitle = (
    <>
      {translate('Table growth monitoring')}{' '}
      <Link
        state="admin-table-growth-settings"
        className="text-decoration-none"
      >
        <Badge variant={isEnabled ? 'success' : 'warning'} pill outline>
          {isEnabled
            ? translate('Monitoring enabled')
            : translate('Monitoring disabled')}
        </Badge>
      </Link>
    </>
  );

  if (isLoading || !data) {
    return (
      <Panel title={panelTitle} cardBordered>
        <div className="text-center py-10">
          <LoadingSpinner />
          <p className="text-muted mt-4">
            {translate('Fetching table growth statistics, please standby...')}
          </p>
        </div>
      </Panel>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return (
      <Panel title={panelTitle} cardBordered>
        <Alert variant="danger" className="d-flex align-items-center mb-0">
          <WarningCircleIcon size={24} weight="bold" className="me-3" />
          <div>
            <strong>
              {translate('Failed to load table growth statistics')}
            </strong>
            <p className="mb-0 mt-1">{errorMessage}</p>
          </div>
        </Alert>
      </Panel>
    );
  }

  const panelActions = (
    <>
      {userIsStaff && (
        <SubmitButton
          submitting={isSampling}
          type="button"
          variant="tertiary"
          className="min-w-100px"
          onClick={() => triggerSampling()}
          label={translate('Sample now')}
          iconNode={<LightningIcon weight="bold" />}
          iconOnLeft
        />
      )}
      <RefreshButton refetch={refetch} isLoading={isRefetching} />
    </>
  );

  return (
    <Panel title={panelTitle} actions={panelActions} cardBordered>
      <TableGrowthOverview data={data} alerts={alerts} />
      <TableGrowthAlerts alerts={alerts} />
      <TableGrowthTable data={data} alerts={alerts} />
    </Panel>
  );
};
