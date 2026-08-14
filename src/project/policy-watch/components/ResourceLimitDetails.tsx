import { FC } from 'react';
import { Resource } from 'waldur-js-client';

import { formatMediumDateTime } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { getUserLocale } from '@/i18n/LanguageUtilsService';
import { POLICY_LABELS } from '@/marketplace/resources/details/ResourceFlags';
import { useProject } from '@/workspace/hooks';

import { ResourceHealth } from '../types';
import { usePolicyWatchData } from '../usePolicyWatchData';

const formatAmount = (value: number): string =>
  value.toLocaleString(getUserLocale(), { maximumFractionDigits: 1 });

/**
 * Per-component consumption, the policy that governs the resource, and why it
 * was paused or downscaled. Kept out of the row so the table stays scannable —
 * the row answers "is anything close to its cap", this answers "what exactly".
 */
const ResourceHealthDetails: FC<{ row: ResourceHealth }> = ({ row }) => {
  const { resource, matchedPolicy, attribution, bucket } = row;
  const limits = (resource.limits || {}) as Record<string, number>;
  const usage = (resource.limit_usage || {}) as Record<string, number>;
  const componentTypes = Object.keys(limits);
  const policyTypeLabel = attribution?.policy_class
    ? POLICY_LABELS[attribution.policy_class] || attribution.policy_class
    : null;

  return (
    <div className="row g-4">
      <div className="col-md-6">
        <h6>{translate('Consumption by component')}</h6>
        {componentTypes.length ? (
          <dl className="row mb-0">
            {componentTypes.map((type) => (
              <>
                <dt className="col-6 fw-normal text-muted" key={`${type}-t`}>
                  {type}
                </dt>
                <dd className="col-6 mb-1" key={`${type}-v`}>
                  {formatAmount(usage[type] || 0)} /{' '}
                  {formatAmount(limits[type])}
                </dd>
              </>
            ))}
          </dl>
        ) : (
          <p className="text-muted mb-0">
            {translate('No per-component quota is configured.')}
          </p>
        )}
      </div>
      <div className="col-md-6">
        <h6>{translate('Policy')}</h6>
        {matchedPolicy ? (
          <dl className="row mb-0">
            <dt className="col-6 fw-normal text-muted">
              {translate('Threshold')}
            </dt>
            <dd className="col-6 mb-1">{matchedPolicy.thresholdLabel}</dd>
            <dt className="col-6 fw-normal text-muted">
              {translate('Action')}
            </dt>
            <dd className="col-6 mb-1">{matchedPolicy.actionLabel}</dd>
            {matchedPolicy.etaDays !== null && (
              <>
                <dt className="col-6 fw-normal text-muted">
                  {translate('Fires in')}
                </dt>
                <dd className="col-6 mb-1">
                  {matchedPolicy.etaDays === 0
                    ? translate('Threshold reached')
                    : translate('~{days} days', {
                        days: matchedPolicy.etaDays,
                      })}
                </dd>
              </>
            )}
          </dl>
        ) : (
          <p className="text-muted mb-0">
            {translate('No usage policy governs this resource.')}
          </p>
        )}
        {(bucket === 'paused' || bucket === 'downscaled') && (
          <>
            <h6 className="mt-4">{translate('Why')}</h6>
            {attribution ? (
              <p className="mb-0">
                {policyTypeLabel}
                {attribution.scope_name && <> — {attribution.scope_name}</>}
                {attribution.timestamp && (
                  <span className="d-block text-muted">
                    {formatMediumDateTime(attribution.timestamp)}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-muted mb-0">
                {translate('Manually set — no policy attribution recorded.')}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Expandable-row body for the project's limit-based resources table. The policy
 * that governs a resource is not part of the marketplace resource payload, so
 * the policy-watch data is pulled here — on expand only, and deduplicated by
 * react-query with the credit health block that mounts the same queries.
 */
export const ProjectResourceLimitDetails: FC<{ row: Resource }> = ({ row }) => {
  const project = useProject();
  const data = usePolicyWatchData(project);

  if (data.isLoading) {
    return <LoadingSpinner />;
  }
  const health = data.perResource.find((r) => r.resource.uuid === row.uuid);
  if (!health) {
    return (
      <p className="text-muted mb-0">
        {translate(
          'No limit or policy details are available for this resource.',
        )}
      </p>
    );
  }
  return <ResourceHealthDetails row={health} />;
};
