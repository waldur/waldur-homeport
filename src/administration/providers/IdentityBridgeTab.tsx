import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { identityBridgeStatsRetrieve } from 'waldur-js-client';

import {
  Badge,
  BadgeVariant,
  PropertyItem,
  PropertyList,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { SHORT_STALE_TIME } from '@/core/constants';
import { formatRelativeWithHour } from '@/core/dateUtils';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { renderFieldOrDash } from '@/table/utils';
import { formatIsdName, IsdBadges } from '@/user/support/IsdBadges';

const HealthIndicator: FC<{
  staleCount: number;
  totalCount: number;
}> = ({ staleCount, totalCount }) => {
  let variant: BadgeVariant;
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
    <Badge variant={variant} shape="pill" tone="outline">
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
    queryFn: () => identityBridgeStatsRetrieve().then((res) => res.data),
    staleTime: SHORT_STALE_TIME,
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
    <div className="flex flex-col gap-5 mt-5">
      {/* Per-ISD Health Table */}
      {stats.users_per_isd?.length > 0 && (
        <div>
          <h5 className="mb-3">{translate('ISD health')}</h5>
          <Table density="compact" className="align-middle">
            <TableHeader>
              <TableRow>
                <TableHead>{translate('ISD')}</TableHead>
                <TableHead>{translate('Users')}</TableHead>
                <TableHead>{translate('Stale users')}</TableHead>
                <TableHead>{translate('Oldest sync')}</TableHead>
                <TableHead>{translate('Health')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.users_per_isd.map((isd) => (
                <TableRow key={isd.isd}>
                  <TableCell>{formatIsdName(isd.isd)}</TableCell>
                  <TableCell>{isd.user_count}</TableCell>
                  <TableCell>
                    <span
                      className={
                        isd.stale_user_count > 0
                          ? 'text-warning font-medium'
                          : ''
                      }
                    >
                      {isd.stale_user_count}
                    </span>
                  </TableCell>
                  <TableCell>
                    {isd.oldest_sync
                      ? formatRelativeWithHour(isd.oldest_sync)
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <HealthIndicator
                      staleCount={isd.stale_user_count}
                      totalCount={isd.user_count}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Identity Managers */}
      {stats.identity_managers?.length > 0 && (
        <div>
          <h5 className="mb-3">{translate('Identity managers')}</h5>
          <Table density="compact" className="align-middle">
            <TableHeader>
              <TableRow>
                <TableHead>{translate('Name')}</TableHead>
                <TableHead>{translate('Managed ISDs')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.identity_managers.map((mgr) => (
                <TableRow key={mgr.uuid}>
                  <TableCell>{mgr.full_name}</TableCell>
                  <TableCell>
                    <IsdBadges isds={mgr.managed_isds} size="sm" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Summary Metrics */}
      <div>
        <h5 className="mb-3">{translate('Summary')}</h5>
        <PropertyList hideActions detailsMode>
          <PropertyItem
            label={translate('Total federated users')}
            value={propVal.count(stats.total_federated_users)}
          />
          <PropertyItem
            label={translate('Active federated users')}
            value={propVal.count(stats.total_active_federated_users)}
          />
          <PropertyItem
            label={translate('Stale threshold')}
            value={translate('{days} days', {
              days: renderFieldOrDash(stats.stale_threshold_days),
            })}
          />
        </PropertyList>
      </div>
    </div>
  );
};
