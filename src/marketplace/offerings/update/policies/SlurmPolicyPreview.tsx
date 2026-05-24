import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { ProgressBar } from 'react-bootstrap';
import {
  Resource,
  marketplaceSlurmPeriodicUsagePoliciesPreviewImpact,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { SECOND } from '@/core/constants';
import { formatDate, formatDateTime } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

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

interface CarryoverDetailsProps {
  previousUsage: number;
  carryoverFactor: number;
  unused: number;
  carryoverCap: number;
  carryover: number;
}

const CarryoverDetails: FC<CarryoverDetailsProps> = ({
  previousUsage,
  carryoverFactor,
  unused,
  carryoverCap,
  carryover,
}) => {
  return (
    <div className="mb-6">
      <h6 className="fw-semibold mb-3">{translate('Carryover Calculation')}</h6>
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
              <span className="text-muted">
                {translate('Carryover Factor')}:{' '}
              </span>
              <strong>{carryoverFactor}%</strong>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-2">
              <span className="text-muted">{translate('Unused')}: </span>
              <strong>{unused.toLocaleString()}</strong>
            </div>
            <div className="mb-2">
              <span className="text-muted">{translate('Carryover Cap')}: </span>
              <strong>{carryoverCap.toLocaleString()}</strong>
            </div>
            <div className="mb-2">
              <span className="text-muted">{translate('Carryover')}: </span>
              <strong className="text-success">
                +{carryover.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
        <div className="mt-2 small text-muted">
          {translate('Formula: carryover = min(unused, {pct}% × base)', {
            pct: carryoverFactor,
          })}
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
      downscaled: { label: translate('Slowdown QoS'), variant: 'warning' },
      paused: { label: translate('Blocked QoS'), variant: 'danger' },
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
            <Badge variant={getQosStatusBadge(currentQosStatus).variant}>
              {getQosStatusBadge(currentQosStatus).label}
            </Badge>
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
  carryover_factor?: number;
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
      carryover_factor: formValues.carryover_factor ?? 50,
      carryover_enabled: formValues.carryover_enabled ?? true,
      resource_uuid: resource?.uuid,
    }),
    [
      allocation,
      formValues.grace_ratio,
      formValues.carryover_factor,
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
    staleTime: 5 * SECOND,
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
          currentQosStatus={
            resource
              ? resource.paused
                ? 'paused'
                : resource.downscaled
                  ? 'downscaled'
                  : 'normal'
              : preview.current_qos_status
          }
          usagePercentage={preview.usage_percentage}
        />
      )}

      {preview.carryover && (
        <>
          {'carryover_factor' in preview.carryover && (
            <CarryoverDetails
              previousUsage={preview.carryover.previous_usage}
              carryoverFactor={preview.carryover.carryover_factor}
              unused={preview.carryover.unused}
              carryoverCap={preview.carryover.carryover_cap}
              carryover={preview.carryover.carryover}
            />
          )}

          <CarryoverInfo
            baseAllocation={preview.carryover.base_allocation}
            unusedCarryover={preview.carryover.carryover ?? 0}
            totalAllocation={preview.carryover.total_allocation}
            carryoverEnabled={preview.carryover_enabled}
          />
        </>
      )}

      {preview.preview_commands && preview.preview_commands.length > 0 && (
        <div className="mt-4">
          <h6>{translate('Preview commands')}</h6>
          <div className="table-responsive">
            <table className="table table-sm table-hover">
              <thead>
                <tr>
                  <th>{translate('Type')}</th>
                  <th>{translate('Description')}</th>
                  <th>{translate('Command')}</th>
                </tr>
              </thead>
              <tbody>
                {preview.preview_commands.map((cmd, idx) => (
                  <tr key={idx}>
                    <td>
                      <Badge variant="secondary" size="sm" pill outline>
                        {cmd.type}
                      </Badge>
                    </td>
                    <td>{cmd.description}</td>
                    <td>
                      <code className="small">{cmd.command}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {preview.command_history && preview.command_history.length > 0 && (
        <div className="mt-4">
          <h6>{translate('Recent command history')}</h6>
          <div className="table-responsive">
            <table className="table table-sm table-hover">
              <thead>
                <tr>
                  <th>{translate('Timestamp')}</th>
                  <th>{translate('Type')}</th>
                  <th>{translate('Command')}</th>
                  <th>{translate('Mode')}</th>
                  <th>{translate('Status')}</th>
                </tr>
              </thead>
              <tbody>
                {preview.command_history.map((cmd) => (
                  <tr key={cmd.uuid}>
                    <td className="text-nowrap">
                      {formatDateTime(cmd.executed_at)}
                    </td>
                    <td>
                      <Badge variant="secondary" size="sm" pill outline>
                        {cmd.command_type}
                      </Badge>
                    </td>
                    <td>
                      <code className="small">{cmd.shell_command}</code>
                    </td>
                    <td>
                      <Badge
                        variant={
                          cmd.execution_mode === 'production'
                            ? 'primary'
                            : 'info'
                        }
                        size="sm"
                        pill
                        outline
                      >
                        {cmd.execution_mode}
                      </Badge>
                    </td>
                    <td>
                      {cmd.success ? (
                        <Badge variant="success" size="sm" pill outline>
                          {translate('OK')}
                        </Badge>
                      ) : (
                        <Badge variant="danger" size="sm" pill outline>
                          {translate('Failed')}
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
