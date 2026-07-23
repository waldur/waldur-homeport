import {
  ArrowsInSimpleIcon,
  ChartPieIcon,
  CheckCircleIcon,
  ClockCountdownIcon,
  PauseCircleIcon,
  WarningCircleIcon,
  WarningOctagonIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';

import { formatDate, formatMediumDateTime } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { lazyComponent } from '@/core/lazyComponent';
import { ProgressBar } from '@/core/ProgressBar';
import { StateIndicator } from '@/core/StateIndicator';
import { WidgetCard } from '@/dashboard/WidgetCard';
import { translate } from '@/i18n';
import { POLICY_LABELS } from '@/marketplace/resources/details/ResourceFlags';
import { useModal } from '@/modal/actions';

const ResourceShowUsageDialog = lazyComponent(() =>
  import('@/marketplace/resources/usage/ResourceShowUsageDialog').then(
    (module) => ({ default: module.ResourceShowUsageDialog }),
  ),
);

import { CreditBreakdownCard } from '../components/CreditBreakdownCard';
import { CreditTermsCard } from '../components/CreditTermsCard';
import { PacingIndicator } from '../components/PacingIndicator';
import {
  PolicyWatchData,
  ResourceHealth,
  ResourceStatusBucket,
} from '../types';

const bucketLabel = (bucket: ResourceStatusBucket): string => {
  switch (bucket) {
    case 'ok':
      return translate('OK');
    case 'notification':
      return translate('Approaching limit');
    case 'slowdown':
      return translate('Over limit');
    case 'paused':
      return translate('Paused');
    case 'downscaled':
      return translate('Downscaled');
  }
};

const BUCKET_VARIANT: Record<
  ResourceStatusBucket,
  'success' | 'warning' | 'danger'
> = {
  ok: 'success',
  notification: 'warning',
  slowdown: 'warning',
  paused: 'danger',
  downscaled: 'danger',
};

const BucketGlyph: FC<{ bucket: ResourceStatusBucket }> = ({ bucket }) => {
  switch (bucket) {
    case 'paused':
      return <PauseCircleIcon weight="bold" />;
    case 'downscaled':
      return <ArrowsInSimpleIcon weight="bold" />;
    case 'slowdown':
      return <WarningOctagonIcon weight="bold" />;
    case 'notification':
      return <WarningCircleIcon weight="bold" />;
    default:
      return <CheckCircleIcon weight="bold" />;
  }
};

const saturationVariant = (
  bucket: ResourceStatusBucket,
): 'success' | 'warning' | 'danger' =>
  bucket === 'paused' || bucket === 'downscaled' || bucket === 'slowdown'
    ? 'danger'
    : bucket === 'notification'
      ? 'warning'
      : 'success';

const RunwayCard: FC<{ data: PolicyWatchData }> = ({ data }) => {
  const { runway } = data;
  const burnPerDay = runway.burnPerDay;
  const days = runway.daysRemaining;
  const isWarn = days !== null && days < 14;
  const isCritical = days !== null && days < 4;

  if (!runway.credit) {
    return (
      <div className="alert alert-info py-2 mb-3">
        {translate(
          'No project credit allocated — runway projection not available.',
        )}
      </div>
    );
  }

  return (
    <div
      className={`border-start border-4 ps-3 mt-3 ${
        isCritical
          ? 'border-danger'
          : isWarn
            ? 'border-warning'
            : 'border-success'
      }`}
    >
      <div className="d-flex flex-wrap align-items-center gap-3">
        <div>
          <small className="text-muted d-block">
            {translate('Credit runway')}
          </small>
          <h4 className="mb-0">
            {days === null
              ? translate('No burn detected')
              : translate('~{days} days', { days })}
          </h4>
        </div>
        <div className="vr d-none d-md-block" />
        <div>
          <small className="text-muted d-block">{translate('Balance')}</small>
          <div className="fw-semibold">
            {defaultCurrency(runway.credit.value)}
          </div>
        </div>
        <div className="vr d-none d-md-block" />
        <div>
          <small className="text-muted d-block">
            {translate('Daily burn')}
          </small>
          <div className="fw-semibold">
            {defaultCurrency(burnPerDay.toFixed(2))}
            <small className="text-muted">/d</small>
          </div>
        </div>
        {runway.exhaustionDate && (
          <>
            <div className="vr d-none d-md-block" />
            <div>
              <small className="text-muted d-block">
                {translate('Exhaustion date')}
              </small>
              <div className="fw-semibold">
                {formatDate(runway.exhaustionDate)}
              </div>
            </div>
          </>
        )}
        {data.policies.some(
          (p) => !p.hasFired && p.etaDays && p.etaDays > 0,
        ) && (
          <>
            <div className="vr d-none d-md-block" />
            <div>
              <small className="text-muted d-block">
                {translate('Next policy event')}
              </small>
              <div className="fw-semibold d-flex align-items-center gap-1">
                <ClockCountdownIcon weight="bold" />
                {(() => {
                  const next = [...data.policies]
                    .filter(
                      (p) => !p.hasFired && p.etaDays !== null && p.etaDays > 0,
                    )
                    .sort(
                      (a, b) => (a.etaDays as number) - (b.etaDays as number),
                    )[0];
                  if (!next) return '—';
                  return translate('{action} in ~{days}d', {
                    action: next.actionLabel,
                    days: next.etaDays as number,
                  });
                })()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ResourceCard: FC<{ health: ResourceHealth }> = ({ health }) => {
  const {
    resource,
    bucket,
    saturationPct,
    hasThreshold,
    attribution,
    matchedPolicy,
  } = health;
  const { openDialog } = useModal();
  const variant = BUCKET_VARIANT[bucket];
  const policyTypeLabel = attribution?.policy_class
    ? POLICY_LABELS[attribution.policy_class] || attribution.policy_class
    : null;
  const canShowUsage = Boolean(
    resource.is_usage_based || resource.is_limit_based,
  );
  const openUsage = () =>
    openDialog(ResourceShowUsageDialog, {
      resolve: { resource },
      size: 'lg',
    });

  return (
    <div
      className="card card-bordered h-100"
      role={canShowUsage ? 'button' : undefined}
      tabIndex={canShowUsage ? 0 : undefined}
      onClick={canShowUsage ? openUsage : undefined}
      onKeyDown={
        canShowUsage
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openUsage();
              }
            }
          : undefined
      }
      style={canShowUsage ? { cursor: 'pointer' } : undefined}
    >
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
          <div className="flex-grow-1 min-w-0">
            <div className="fw-semibold text-truncate" title={resource.name}>
              {resource.name}
            </div>
            <small className="text-muted text-truncate d-block">
              {resource.offering_name}
            </small>
          </div>
          <StateIndicator
            label={bucketLabel(bucket)}
            variant={variant}
            size="sm"
            pill
            outline
          />
        </div>
        {canShowUsage && (
          <small className="text-primary d-flex align-items-center gap-1 mb-2">
            <ChartPieIcon weight="bold" /> {translate('View usage')}
          </small>
        )}
        {hasThreshold && (
          <div className="d-flex align-items-center gap-2 mb-2">
            <BucketGlyph bucket={bucket} />
            <div className="flex-grow-1">
              <ProgressBar
                now={Math.min(Math.max(saturationPct, 0), 100)}
                max={100}
                variant={saturationVariant(bucket)}
                compact
              />
              <small className="text-muted">
                {translate('{pct}% of usage quota', {
                  pct: saturationPct.toFixed(1),
                })}
              </small>
            </div>
          </div>
        )}
        {(bucket === 'paused' || bucket === 'downscaled') && (
          <div className="mb-2">
            <small className="text-danger fw-medium d-block">
              {translate('Why?')}
            </small>
            {attribution ? (
              <small className="d-block">
                {policyTypeLabel && <span>{policyTypeLabel}</span>}
                {attribution.scope_name && (
                  <span> — {attribution.scope_name}</span>
                )}
                {attribution.limit_cost && (
                  <span>
                    {' '}
                    ({translate('limit')}: {attribution.limit_cost})
                  </span>
                )}
                {attribution.timestamp && (
                  <span className="d-block text-muted">
                    {formatMediumDateTime(attribution.timestamp)}
                  </span>
                )}
              </small>
            ) : (
              <small className="text-muted d-block">
                {translate('Manually set — no policy attribution recorded.')}
              </small>
            )}
          </div>
        )}
        {bucket === 'ok' &&
          matchedPolicy?.etaDate &&
          matchedPolicy.etaDays !== null && (
            <div>
              <small className="text-muted d-block">{translate('When?')}</small>
              <small>
                {matchedPolicy.etaDays === 0
                  ? translate('Threshold reached')
                  : translate('~{days} days until {action}', {
                      days: matchedPolicy.etaDays,
                      action: matchedPolicy.actionLabel,
                    })}
              </small>
            </div>
          )}
        {(bucket === 'notification' || bucket === 'slowdown') &&
          matchedPolicy && (
            <div>
              <small className="text-warning fw-medium d-block">
                {translate('Heads up')}
              </small>
              <small>
                {translate(
                  '{label}: {action} will fire when threshold is exceeded.',
                  {
                    label: matchedPolicy.thresholdLabel,
                    action: matchedPolicy.actionLabel,
                  },
                )}
              </small>
            </div>
          )}
      </div>
    </div>
  );
};

interface Props {
  data: PolicyWatchData;
}

export const HealthView: FC<Props> = ({ data }) => {
  if (data.resources.length === 0) {
    return (
      <div className="alert alert-info">
        {translate('No resources to evaluate against policies.')}
      </div>
    );
  }
  const sorted = [...data.perResource].sort((a, b) => {
    const order: Record<ResourceStatusBucket, number> = {
      paused: 0,
      downscaled: 1,
      slowdown: 2,
      notification: 3,
      ok: 4,
    };
    return order[a.bucket] - order[b.bucket];
  });

  return (
    <>
      <WidgetCard
        cardTitle={translate("This month's credit consumption")}
        className="mb-3"
      >
        <PacingIndicator pacing={data.pacing} creditTerms={data.creditTerms} />
        {data.creditTerms && <CreditTermsCard terms={data.creditTerms} />}
      </WidgetCard>

      <WidgetCard cardTitle={translate('Overall credit')} className="mb-3">
        <RunwayCard data={data} />
        {data.creditBreakdown && (
          <CreditBreakdownCard
            breakdown={data.creditBreakdown}
            endDate={data.creditTerms?.endDate}
            daysUntilEndDate={data.creditTerms?.daysUntilEndDate}
          />
        )}
      </WidgetCard>

      <WidgetCard cardTitle={translate('Resources')} className="mb-3">
        {data.policies.length === 0 && (
          <div className="alert alert-info py-2 mt-3">
            {translate(
              'No cost or SLURM usage policies are configured for this project.',
            )}
          </div>
        )}
        <div className="row g-3 mt-1">
          {sorted.map((h) => (
            <div className="col-md-6 col-xl-4" key={h.resource.uuid}>
              <ResourceCard health={h} />
            </div>
          ))}
        </div>
      </WidgetCard>
    </>
  );
};
