import { groupBy } from 'lodash-es';
import { FC } from 'react';
import { Card } from 'react-bootstrap';
import { Resource, SpendingLimitStatus } from 'waldur-js-client';

import { AlertItem, Badge, Progress } from 'waldur-ui';

import { formatMediumDateTime, formatRelative } from '@/core/dateUtils';
import { translate } from '@/i18n';
import {
  formatSpendingAmount,
  getSpendingLimitLabel,
} from '@/marketplace/common/spendingLimits';

type StatusResource = Pick<
  Resource,
  | 'spending_limit_status'
  | 'usage_limit_restriction'
  | 'usage_limit_resumes_at'
  | 'offering_components'
>;

const getComponent = (resource: StatusResource, type: string) =>
  resource.offering_components?.find((component) => component.type === type);

const getComponentName = (resource: StatusResource, type: string) =>
  getComponent(resource, type)?.name || type;

const getPercent = (status: SpendingLimitStatus) =>
  status.limit > 0 ? (status.used / status.limit) * 100 : 100;

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
        {new Date(status.resets_at).getTime() <= Date.now()
          ? translate('Resets shortly')
          : translate('Resets {relative}, on {date}', {
              relative: formatRelative(status.resets_at),
              date: formatMediumDateTime(status.resets_at),
            })}
      </div>
    </div>
  );
};

const RestrictionNotice: FC<{ resource: StatusResource }> = ({ resource }) => {
  if (!resource.usage_limit_restriction) {
    return null;
  }
  const reached = (resource.spending_limit_status || []).filter(
    (status) => status.reached,
  );
  if (reached.length === 0) {
    return null;
  }
  const limits = reached
    .map((status) =>
      translate('{component} — {limit}', {
        component: getComponentName(resource, status.component_type),
        limit: getSpendingLimitLabel(status.period),
      }),
    )
    .join('; ');
  // A downscaled resource keeps access, so its notice speaks of the restriction.
  const downscaled = resource.usage_limit_restriction === 'downscaled';
  const title = downscaled
    ? translate('The resource is downscaled: a spending limit is reached')
    : translate('Access is paused: a spending limit is reached');
  const resumesAt = resource.usage_limit_resumes_at;
  // The reset task lifts the restriction within a few minutes of this time.
  const resumes = !resumesAt
    ? downscaled
      ? translate(
          'The restriction lifts once usage is under every limit of the resource again.',
        )
      : translate(
          'Access resumes once usage is under every limit of the resource again.',
        )
    : new Date(resumesAt).getTime() <= Date.now()
      ? downscaled
        ? translate('The restriction lifts shortly.')
        : translate('Access resumes shortly.')
      : downscaled
        ? translate('The restriction lifts {relative}, on {date}.', {
            relative: formatRelative(resumesAt),
            date: formatMediumDateTime(resumesAt),
          })
        : translate('Access resumes {relative}, on {date}.', {
            relative: formatRelative(resumesAt),
            date: formatMediumDateTime(resumesAt),
          });
  const body = (
    <>
      <div>{translate('Held by: {limits}.', { limits })}</div>
      <div>{resumes}</div>
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
