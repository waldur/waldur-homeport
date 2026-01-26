import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { ProgressBar } from 'react-bootstrap';
import {
  Resource,
  marketplaceSlurmPeriodicUsagePoliciesPreviewImpact,
} from 'waldur-js-client';

import { formatDate } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import './SlurmPolicyPreview.scss';

interface ThresholdVisualizationProps {
  allocation: number;
  notificationThreshold: number;
  slowdownThreshold: number;
  blockedThreshold: number;
  graceRatio: number;
  currentUsage?: number;
}

const ThresholdVisualization: FC<ThresholdVisualizationProps> = ({
  allocation,
  notificationThreshold,
  slowdownThreshold,
  blockedThreshold,
  graceRatio,
  currentUsage,
}) => {
  // Calculate percentages relative to blocked threshold (max)
  const max = blockedThreshold;
  const notificationPct = (notificationThreshold / max) * 100;
  const slowdownPct = ((slowdownThreshold - notificationThreshold) / max) * 100;
  const gracePct = ((blockedThreshold - slowdownThreshold) / max) * 100;
  const currentUsagePct = currentUsage
    ? Math.min((currentUsage / max) * 100, 100)
    : undefined;

  return (
    <div className="mb-6">
      <h6 className="fw-semibold mb-3">
        {translate('Threshold Visualization')}
      </h6>
      <div className="position-relative">
        <ProgressBar style={{ height: '30px' }} className="threshold-progress">
          <ProgressBar
            variant="success"
            now={notificationPct}
            key={1}
            label={translate('Normal')}
          />
          <ProgressBar
            variant="warning"
            now={slowdownPct}
            key={2}
            label={translate('Notification')}
          />
          <ProgressBar
            variant="danger"
            now={gracePct}
            key={3}
            label={translate('Grace')}
          />
        </ProgressBar>
        {currentUsagePct !== undefined && (
          <div
            className="position-absolute top-0 bottom-0"
            style={{
              left: `${currentUsagePct}%`,
              width: '3px',
              backgroundColor: '#000',
              zIndex: 10,
            }}
            title={translate('Current usage: {usage}', {
              usage: currentUsage?.toLocaleString(),
            })}
          >
            <div
              className="position-absolute"
              style={{
                top: '-20px',
                left: '-30px',
                width: '60px',
                textAlign: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
              }}
            >
              {translate('Current')}
            </div>
          </div>
        )}
      </div>
      <div className="d-flex justify-content-between mt-2 small text-muted">
        <span>0</span>
        <span>
          {notificationThreshold.toLocaleString()} (80%)
          <br />
          <span className="text-warning">{translate('Notification')}</span>
        </span>
        <span>
          {slowdownThreshold.toLocaleString()} (100%)
          <br />
          <span className="text-warning">{translate('Slowdown QoS')}</span>
        </span>
        <span>
          {blockedThreshold.toLocaleString()} (
          {((1 + graceRatio) * 100).toFixed(0)}%)
          <br />
          <span className="text-danger">{translate('Blocked QoS')}</span>
        </span>
      </div>
      <div className="mt-3 small">
        <strong>{translate('Allocation')}: </strong>
        {allocation.toLocaleString()} {translate('units')}
        {currentUsage !== undefined && (
          <>
            {' | '}
            <strong>{translate('Current Usage')}: </strong>
            {currentUsage.toLocaleString()} {translate('units')}
          </>
        )}
      </div>
    </div>
  );
};

interface DecayCalculatorProps {
  previousUsage: number;
  daysElapsed: number;
  halfLife: number;
  decayFactor: number;
  effectiveUsage: number;
}

const DecayCalculator: FC<DecayCalculatorProps> = ({
  previousUsage,
  daysElapsed,
  halfLife,
  decayFactor,
  effectiveUsage,
}) => {
  const decayPercentage = (1 - decayFactor) * 100;

  return (
    <div className="mb-6">
      <h6 className="fw-semibold mb-3">{translate('Decay Impact')}</h6>
      <div className="border rounded p-3">
        <div className="row">
          <div className="col-md-6">
            <div className="mb-2">
              <span className="text-muted">
                {translate('Previous Usage')}:{' '}
              </span>
              <strong>{previousUsage.toLocaleString()}</strong>
            </div>
            <div className="mb-2">
              <span className="text-muted">{translate('Days Elapsed')}: </span>
              <strong>{daysElapsed}</strong>
            </div>
            <div className="mb-2">
              <span className="text-muted">{translate('Half-Life')}: </span>
              <strong>
                {halfLife} {translate('days')}
              </strong>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-2">
              <span className="text-muted">{translate('Decay Factor')}: </span>
              <strong>{(decayFactor * 100).toFixed(2)}%</strong>
            </div>
            <div className="mb-2">
              <span className="text-muted">{translate('Usage Decayed')}: </span>
              <strong className="text-success">
                -{decayPercentage.toFixed(1)}%
              </strong>
            </div>
            <div className="mb-2">
              <span className="text-muted">
                {translate('Effective Usage')}:{' '}
              </span>
              <strong>{effectiveUsage.toLocaleString()}</strong>
            </div>
          </div>
        </div>
        <div className="mt-2 small text-muted">
          {translate('Formula: decay_factor = 2^(-days / half_life)')}
        </div>
      </div>
    </div>
  );
};

interface CarryoverInfoProps {
  baseAllocation: number;
  unusedCarryover: number;
  totalAllocation: number;
  carryoverEnabled: boolean;
}

const CarryoverInfo: FC<CarryoverInfoProps> = ({
  baseAllocation,
  unusedCarryover,
  totalAllocation,
  carryoverEnabled,
}) => {
  if (!carryoverEnabled) {
    return (
      <div className="mb-6">
        <h6 className="fw-semibold mb-3">{translate('Carryover')}</h6>
        <div className="text-muted">
          {translate(
            'Carryover is disabled. Unused allocation will not carry over to the next period.',
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h6 className="fw-semibold mb-3">{translate('Carryover Calculation')}</h6>
      <div className="border rounded p-3">
        <div className="d-flex align-items-center mb-2">
          <span className="me-2">{translate('Base Allocation')}</span>
          <span className="fw-bold">{baseAllocation.toLocaleString()}</span>
        </div>
        {unusedCarryover > 0 && (
          <div className="d-flex align-items-center mb-2">
            <span className="me-2">+ {translate('Unused Carryover')}</span>
            <span className="fw-bold text-success">
              +{unusedCarryover.toLocaleString()}
            </span>
          </div>
        )}
        <hr />
        <div className="d-flex align-items-center">
          <span className="me-2">{translate('Total Allocation')}</span>
          <span className="fw-bold fs-5">
            {totalAllocation.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

interface DateProjection {
  days: number | null;
  date: string | null;
  status: 'never' | 'exceeded' | 'projected';
}

interface DateProjectionsProps {
  projections: {
    notification: DateProjection;
    slowdown: DateProjection;
    blocked: DateProjection;
  };
  currentQosStatus?: string;
  usagePercentage?: number;
}

const DateProjections: FC<DateProjectionsProps> = ({
  projections,
  currentQosStatus,
  usagePercentage,
}) => {
  const renderProjection = (
    label: string,
    projection: DateProjection,
    variant: 'warning' | 'info' | 'danger',
  ) => {
    let statusText: string;
    let statusClass: string;

    if (projection.status === 'exceeded') {
      statusText = translate('Already exceeded');
      statusClass = 'text-danger fw-bold';
    } else if (projection.status === 'never') {
      statusText = translate('Never at current rate');
      statusClass = 'text-success';
    } else {
      statusText = projection.date
        ? `${formatDate(projection.date)} (${translate('{days} days', { days: projection.days })})`
        : translate('Unknown');
      statusClass = `text-${variant}`;
    }

    return (
      <div className="mb-2">
        <span className="text-muted">{label}: </span>
        <span className={statusClass}>{statusText}</span>
      </div>
    );
  };

  const getQosStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; variant: string }> = {
      normal: { label: translate('Normal'), variant: 'success' },
      notification: {
        label: translate('Notification Sent'),
        variant: 'warning',
      },
      slowdown: { label: translate('Slowdown QoS'), variant: 'warning' },
      blocked: { label: translate('Blocked QoS'), variant: 'danger' },
    };
    return badges[status] || { label: status, variant: 'secondary' };
  };

  return (
    <div className="mb-6">
      <h6 className="fw-semibold mb-3">{translate('Date Projections')}</h6>
      <div className="border rounded p-3">
        {currentQosStatus && (
          <div className="mb-3">
            <span className="text-muted">
              {translate('Current QoS Status')}:{' '}
            </span>
            <span
              className={`badge bg-${getQosStatusBadge(currentQosStatus).variant}`}
            >
              {getQosStatusBadge(currentQosStatus).label}
            </span>
            {usagePercentage !== undefined && (
              <span className="ms-2 text-muted">
                ({usagePercentage.toFixed(1)}% {translate('of allocation')})
              </span>
            )}
          </div>
        )}
        {renderProjection(
          translate('Notification threshold'),
          projections.notification,
          'info',
        )}
        {renderProjection(
          translate('Slowdown threshold'),
          projections.slowdown,
          'warning',
        )}
        {renderProjection(
          translate('Blocked threshold'),
          projections.blocked,
          'danger',
        )}
        <div className="mt-3 small text-muted">
          {translate(
            'Projections are based on average daily usage rate. Actual dates may vary.',
          )}
        </div>
      </div>
    </div>
  );
};

interface SlurmPolicyFormValues {
  grace_ratio?: number;
  fairshare_decay_half_life?: number;
  carryover_enabled?: boolean;
}

interface SlurmPolicyPreviewProps {
  allocation?: number;
  formValues: SlurmPolicyFormValues;
  resource?: Resource | null;
}

export const SlurmPolicyPreview: FC<SlurmPolicyPreviewProps> = ({
  allocation = 1000,
  formValues,
  resource,
}) => {
  // Build preview request from form values
  const previewParams = useMemo(
    () => ({
      allocation,
      grace_ratio: formValues.grace_ratio ?? 0.2,
      previous_usage: 500, // Example previous usage for preview
      fairshare_decay_half_life: formValues.fairshare_decay_half_life ?? 15,
      carryover_enabled: formValues.carryover_enabled ?? true,
      days_elapsed: 90, // Default for quarterly
      resource_uuid: resource?.uuid,
    }),
    [
      allocation,
      formValues.grace_ratio,
      formValues.fairshare_decay_half_life,
      formValues.carryover_enabled,
      resource?.uuid,
    ],
  );

  const {
    data: preview,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['slurm-policy-preview', previewParams],
    queryFn: async () => {
      const response = await marketplaceSlurmPeriodicUsagePoliciesPreviewImpact(
        {
          body: previewParams,
        },
      );
      return response.data;
    },
    staleTime: 5000,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !preview) {
    return (
      <div className="text-muted">
        {translate(
          'Preview not available. Configure the policy to see impact calculations.',
        )}
      </div>
    );
  }

  return (
    <div>
      {resource && (
        <div className="alert alert-info mb-4">
          <strong>{translate('Resource')}: </strong>
          {resource.name || resource.uuid}
          {preview.current_usage !== undefined && (
            <span className="ms-3">
              <strong>{translate('Current Usage')}: </strong>
              {preview.current_usage.toLocaleString()}
              {preview.daily_usage_rate !== undefined &&
                preview.daily_usage_rate > 0 && (
                  <span className="text-muted">
                    {' '}
                    ({preview.daily_usage_rate.toFixed(2)}{' '}
                    {translate('per day avg')})
                  </span>
                )}
            </span>
          )}
        </div>
      )}

      <ThresholdVisualization
        allocation={preview.effective_allocation}
        notificationThreshold={preview.thresholds.notification_threshold}
        slowdownThreshold={preview.thresholds.slowdown_threshold}
        blockedThreshold={preview.thresholds.blocked_threshold}
        graceRatio={preview.grace_ratio}
        currentUsage={preview.current_usage}
      />

      {preview.date_projections && (
        <DateProjections
          projections={preview.date_projections}
          currentQosStatus={preview.current_qos_status}
          usagePercentage={preview.usage_percentage}
        />
      )}

      {preview.carryover && (
        <>
          <DecayCalculator
            previousUsage={preview.carryover.previous_usage}
            daysElapsed={preview.carryover.days_elapsed}
            halfLife={preview.carryover.half_life}
            decayFactor={preview.carryover.decay_factor}
            effectiveUsage={preview.carryover.effective_usage}
          />

          <CarryoverInfo
            baseAllocation={preview.carryover.base_allocation}
            unusedCarryover={preview.carryover.unused_carryover}
            totalAllocation={preview.carryover.total_allocation}
            carryoverEnabled={preview.carryover_enabled}
          />
        </>
      )}

      <div className="small text-muted mt-4">
        <strong>{translate('Note')}: </strong>
        {resource
          ? translate(
              'This preview uses actual usage data from the selected resource.',
            )
          : translate(
              'This preview shows policy impact based on example values. Select a resource to see projections based on real usage.',
            )}
      </div>
    </div>
  );
};
