import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  marketplaceProviderResourcesList,
  marketplaceResourcesList,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { useDebouncedValue } from '@/core/useDebouncedValue';
import { translate } from '@/i18n';

import { MAINTENANCE_IMPACT_LEVEL, MaintenanceForm } from '../types';

interface ImpactSummaryProps {
  offerings: MaintenanceForm['offerings'];
  impactLevels?: MaintenanceForm['impact_level'];
  /** Service provider whose offerings are being maintained. When provided,
   * the provider-scoped resource endpoint is used so the user sees impact on
   * resources they provide (not just resources they consume). */
  provider?: { uuid?: string; customer_uuid?: string };
  /** Compact mode is used in the review step. */
  compact?: boolean;
}

const getInitials = (name: string): string => {
  if (!name) return '?';
  const tokens = name.trim().split(/\s+/).slice(0, 2);
  return tokens.map((t) => t[0]?.toUpperCase() ?? '').join('') || '?';
};

const TOP_N = 5;

export const ImpactSummary: FC<ImpactSummaryProps> = ({
  offerings,
  impactLevels,
  provider,
  compact,
}) => {
  const selectedUuids = useMemo(() => {
    const list = (offerings ?? []).map((o) => o.uuid).filter(Boolean);
    return [...new Set(list)].sort();
  }, [offerings]);

  const debouncedUuids = useDebouncedValue(selectedUuids, 300);

  // Prefer the provider-scoped endpoint so service providers see resources
  // they provide (gated by filter_for_service_provider). Fall back to the
  // consumer-scoped endpoint only when no provider is in scope (rare staff
  // case) — staff can see everything either way.
  const providerUuid = provider?.uuid;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      'MaintenanceImpactSummary',
      providerUuid ?? null,
      debouncedUuids,
    ],
    queryFn: () =>
      getAllPages((page) =>
        providerUuid
          ? marketplaceProviderResourcesList({
              query: {
                provider_uuid: providerUuid,
                offering_uuid: debouncedUuids,
                field: [
                  'uuid',
                  'customer_uuid',
                  'customer_name',
                  'project_uuid',
                  'offering_uuid',
                ],
                page_size: MAX_PAGE_SIZE,
                page,
              },
            })
          : marketplaceResourcesList({
              query: {
                offering_uuid: debouncedUuids,
                field: [
                  'uuid',
                  'customer_uuid',
                  'customer_name',
                  'project_uuid',
                  'offering_uuid',
                ],
                page_size: MAX_PAGE_SIZE,
                page,
              },
            }),
      ),
    enabled: debouncedUuids.length > 0,
    staleTime: UI_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalResources: 0,
        customerCount: 0,
        topCustomers: [] as Array<{
          uuid: string;
          name: string;
          resourceCount: number;
        }>,
      };
    }
    const byCustomer = new Map<
      string,
      { uuid: string; name: string; resourceCount: number }
    >();
    for (const resource of data as any[]) {
      const uuid = resource.customer_uuid ?? 'unknown';
      const name = resource.customer_name ?? translate('Unknown');
      const entry = byCustomer.get(uuid);
      if (entry) {
        entry.resourceCount += 1;
      } else {
        byCustomer.set(uuid, { uuid, name, resourceCount: 1 });
      }
    }
    const ranked = Array.from(byCustomer.values()).sort(
      (a, b) => b.resourceCount - a.resourceCount,
    );
    return {
      totalResources: data.length,
      customerCount: byCustomer.size,
      topCustomers: ranked.slice(0, TOP_N),
      remainingCustomers: Math.max(0, byCustomer.size - TOP_N),
    };
  }, [data]);

  const impactBreakdown = useMemo(() => {
    if (!offerings?.length || !impactLevels) return [];
    const counts: Record<string, number> = {};
    for (const offering of offerings) {
      const level = impactLevels?.[offering.uuid];
      if (level) {
        counts[String(level)] = (counts[String(level)] ?? 0) + 1;
      }
    }
    return Object.entries(counts).map(([level, count]) => ({
      level,
      label: MAINTENANCE_IMPACT_LEVEL[level] ?? level,
      count,
    }));
  }, [offerings, impactLevels]);

  if (!selectedUuids.length) {
    return (
      <div
        className={
          compact
            ? 'text-muted'
            : 'border rounded p-5 text-muted text-center bg-light'
        }
      >
        {translate('Select offerings to see who will be notified.')}
      </div>
    );
  }

  const loading = isLoading || isFetching;

  return (
    <div className={compact ? '' : 'border rounded p-4 bg-light'}>
      {!compact && <h6 className="mb-3">{translate('Estimated impact')}</h6>}
      <div className="d-flex gap-4 flex-wrap mb-3">
        <div>
          <div className="text-muted small">
            {translate('Distinct customers')}
          </div>
          <div className="fs-2 fw-bold">
            {loading ? '…' : stats.customerCount}
          </div>
        </div>
        <div>
          <div className="text-muted small">
            {translate('Total affected resources')}
          </div>
          <div className="fs-2 fw-bold">
            {loading ? '…' : stats.totalResources}
          </div>
        </div>
      </div>

      {impactBreakdown.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-3">
          {impactBreakdown.map((item) => (
            <span
              key={item.level}
              className="badge badge-light-info"
              title={item.label}
            >
              {item.label}: {item.count}
            </span>
          ))}
        </div>
      )}

      {stats.topCustomers.length > 0 && (
        <>
          <div className="text-muted small mb-2">
            {translate('Top affected customers')}
          </div>
          <ul className="list-unstyled mb-0">
            {stats.topCustomers.map((customer) => (
              <li
                key={customer.uuid}
                className="d-flex align-items-center gap-2 mb-2"
              >
                <span
                  className="symbol symbol-30px"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    backgroundColor: '#e4e6ef',
                    fontWeight: 600,
                  }}
                >
                  {getInitials(customer.name)}
                </span>
                <span className="flex-grow-1 text-truncate">
                  {customer.name}
                </span>
                <span className="text-muted small">
                  {translate('{count} resources', {
                    count: customer.resourceCount,
                  })}
                </span>
              </li>
            ))}
          </ul>
          {stats.remainingCustomers ? (
            <div className="text-muted small">
              {translate('+{count} more', { count: stats.remainingCustomers })}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};
