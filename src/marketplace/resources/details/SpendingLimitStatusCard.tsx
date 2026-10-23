import { groupBy } from 'es-toolkit';
import { FC } from 'react';
import { Card } from 'react-bootstrap';
import { SpendingLimitStatus } from 'waldur-js-client';

import { AlertItem, Badge, Progress } from 'waldur-ui';

import { formatMediumDateTime, formatRelative } from '@/core/dateUtils';
import { translate } from '@/i18n';
import {
  formatSpendingAmount,
  getSpendingLimitLabel,
} from '@/marketplace/common/spendingLimits';

import {
  getRestrictionHeldBy,
  getRestrictionResumes,
  RestrictedResource,
} from './spendingLimitRestriction';

type StatusResource = RestrictedResource;

const getComponent = (resource: StatusResource, type: string) =>
  resource.offering_components?.find((component) => component.type === type);

const getComponentName = (resource: StatusResource, type: string) =>
  getComponent(resource, type)?.name || type;

const getPercent = (status: SpendingLimitStatus) =>
  status.limit > 0 ? (status.used / status.limit) * 100 : 100;

// An all-time limit has no reset time: it never resets.
const ResetText: FC<{ resetsAt: string | null }> = ({ resetsAt }) =>
  !resetsAt
    ? translate('Never resets')
    : new Date(resetsAt).getTime() <= Date.now()
      ? translate('Resets shortly')
      : translate('Resets {relative}, on {date}', {
          relative: formatRelative(resetsAt),
          date: formatMediumDateTime(resetsAt),
        });

const StatusRow: FC<{ status: SpendingLimitStatus; unit?: string }> = ({
  status,
  unit,
}) => {
  const percent = getPercent(status);
  const label = getSpendingLimitLabel(status.period);
  return (
    <div
      className="mb-4 last:mb-0"
      data-testid={`spending-limit-status-${status.component_type}-${status.period}`}
    >
      <div className="mb-1 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium text-secondary">{label}</span>
        {status.reached && (
          <Badge variant="danger">{translate('Reached')}</Badge>
        )}
        <span className="ms-auto text-tertiary">
          {translate('{used} / {limit}', {
            used: formatSpendingAmount(status.used),
            limit: formatSpendingAmount(status.limit),
          })}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
      <Progress
        value={Math.min(percent, 100)}
        variant={
          status.reached ? 'danger' : percent >= 80 ? 'warning' : 'primary'
        }
        label={label}
        size="sm"
      />
      <div className="mt-1 text-xs text-quaternary">
        <ResetText resetsAt={status.resets_at} />
      </div>
    </div>
  );
};

const RestrictionNotice: FC<{ resource: StatusResource }> = ({ resource }) => {
  if (!resource.usage_limit_restriction) {
    return null;
  }
  const heldBy = getRestrictionHeldBy(resource);
  if (!heldBy) {
    return null;
  }
  // A downscaled resource keeps access, so its notice speaks of the restriction.
  const title =
    resource.usage_limit_restriction === 'downscaled'
      ? translate('The resource is downscaled: a spending limit is reached')
      : translate('Access is paused: a spending limit is reached');
  const body = (
    <>
      <div>{heldBy}</div>
      <div>{getRestrictionResumes(resource)}</div>
    </>
  );
  return (
    <AlertItem
      variant="warning"
      type="floating"
      iconSize="md"
      className="mb-5"
      title={title}
      body={body}
      data-testid="spending-limit-restriction"
    />
  );
};

/**
 * The resource's spending limits: how much of each is used, when it resets,
 * when usage was last reported, and which limit holds the resource while a
 * reached one restricts it.
 */
export const SpendingLimitStatusCard: FC<{ resource: StatusResource }> = ({
  resource,
}) => {
  const statuses = resource.spending_limit_status || [];
  if (statuses.length === 0) {
    return null;
  }
  const byComponent = groupBy(statuses, (status) => status.component_type);
  return (
    <Card className="card-bordered mb-6">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Spending limits')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <RestrictionNotice resource={resource} />
        {Object.entries(byComponent).map(([type, componentStatuses]) => {
          const lastReportedAt = componentStatuses[0].last_reported_at;
          return (
            <div key={type} className="mb-6 last:mb-0">
              <div className="mb-3 flex flex-wrap items-baseline gap-2">
                <h4 className="mb-0 text-base font-semibold text-primary">
                  {getComponentName(resource, type)}
                </h4>
                <span className="text-sm text-tertiary">
                  {lastReportedAt
                    ? translate('Usage last reported {relative}', {
                        relative: formatRelative(lastReportedAt),
                      })
                    : translate('No usage reported yet')}
                </span>
              </div>
              {componentStatuses.map((status) => (
                <StatusRow
                  key={status.period}
                  status={status}
                  unit={getComponent(resource, type)?.measured_unit}
                />
              ))}
            </div>
          );
        })}
      </Card.Body>
    </Card>
  );
};
