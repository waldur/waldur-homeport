import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  IdentityBridgeStats,
  identityBridgeStatsRetrieve,
} from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatRelativeWithHour } from '@waldur/core/dateUtils';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { renderFieldOrDash } from '@waldur/table/utils';
import { formatIsdName, IsdBadges } from '@waldur/user/support/IsdBadges';

const HealthIndicator: FC<{
  staleCount: number;
  totalCount: number;
}> = ({ staleCount, totalCount }) => {
  let variant: string;
  let label: string;
  if (staleCount === 0) {
    variant = 'success';
    label = translate('Healthy');
  } else if (totalCount > 0 && staleCount / totalCount < 0.05) {
    variant = 'warning';
    label = translate('Warning');
  } else {
    variant = 'danger';
    label = translate('Unhealthy');
  }
  return (
    <Badge variant={variant} pill outline>
      {label}
    </Badge>
  );
};

export const IdentityBridgeTab: FC = () => {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['identity-bridge-stats'],
    queryFn: () =>
      identityBridgeStatsRetrieve().then(
        (res) => res.data as IdentityBridgeStats,
      ),
    staleTime: 60 * 1000,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <LoadingErred
        message={translate('Unable to load identity bridge statistics.')}
        loadData={refetch}
      />
    );
  if (!stats) return null;

  return (
    <div className="d-flex flex-column gap-6 mt-6">
      {/* Per-ISD Health Table */}
      {stats.users_per_isd?.length > 0 && (
        <div>
          <h5 className="mb-4">{translate('ISD health')}</h5>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead>
                <tr>
                  <th>{translate('ISD')}</th>
                  <th>{translate('Users')}</th>
                  <th>{translate('Stale users')}</th>
                  <th>{translate('Oldest sync')}</th>
                  <th>{translate('Health')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.users_per_isd.map((isd) => (
                  <tr key={isd.isd}>
                    <td>{formatIsdName(isd.isd)}</td>
                    <td>{isd.user_count}</td>
                    <td>
                      <span
                        className={
                          isd.stale_user_count > 0 ? 'text-warning fw-bold' : ''
                        }
                      >
                        {isd.stale_user_count}
                      </span>
                    </td>
                    <td>
                      {isd.oldest_sync
                        ? formatRelativeWithHour(isd.oldest_sync)
                        : '—'}
                    </td>
                    <td>
                      <HealthIndicator
                        staleCount={isd.stale_user_count}
                        totalCount={isd.user_count}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Identity Managers */}
      {stats.identity_managers?.length > 0 && (
        <div>
          <h5 className="mb-4">{translate('Identity managers')}</h5>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead>
                <tr>
                  <th>{translate('Name')}</th>
                  <th>{translate('Managed ISDs')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.identity_managers.map((mgr) => (
                  <tr key={mgr.uuid}>
                    <td>{mgr.full_name}</td>
                    <td>
                      <IsdBadges isds={mgr.managed_isds} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Metrics */}
      <div>
        <h5 className="mb-4">{translate('Summary')}</h5>
        <FormTable hideActions detailsMode className="gy-5">
          <FormTable.Item
            label={translate('Total federated users')}
            value={String(stats.total_federated_users ?? 0)}
          />
          <FormTable.Item
            label={translate('Active federated users')}
            value={String(stats.total_active_federated_users ?? 0)}
          />
          <FormTable.Item
            label={translate('Stale threshold')}
            value={translate('{days} days', {
              days: renderFieldOrDash(stats.stale_threshold_days),
            })}
          />
        </FormTable>
      </div>
    </div>
  );
};
