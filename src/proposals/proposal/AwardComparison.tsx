import { FC, Fragment } from 'react';

import { Badge, BadgeVariant } from 'waldur-ui';

import { translate } from '@/i18n';
import { AwardComparisonRow } from '@/proposals/awardedResources';
import {
  getRequestableComponents,
  getRowLimits,
  hasRequestedAmount,
} from '@/proposals/requestedResourceCost';
import { renderFieldOrDash } from '@/table/utils';

const CHANGE_VARIANTS: Record<AwardComparisonRow['change'], BadgeVariant> = {
  unchanged: 'neutral',
  changed: 'warning',
  moved: 'info',
  added: 'success',
  removed: 'danger',
};

const changeLabel = (change: AwardComparisonRow['change']) =>
  ({
    unchanged: translate('As requested'),
    changed: translate('Changed'),
    moved: translate('Moved'),
    added: translate('Added'),
    removed: translate('Not awarded'),
  })[change];

export const AwardChangeBadge: FC<{ change: AwardComparisonRow['change'] }> = ({
  change,
}) => (
  <Badge variant={CHANGE_VARIANTS[change]} shape="pill" tone="outline">
    {changeLabel(change)}
  </Badge>
);

/**
 * The offering an item is awarded on and its plan, with what they were asked
 * for where they differ, and the change badge. One column rather than three,
 * so the table fits beside the proposal's progress rail.
 */
export const AwardOfferingCell: FC<{ row: AwardComparisonRow }> = ({ row }) => {
  const offering = (row.awarded ?? row.requested).requested_offering;
  const requestedPlan = row.requested?.requested_offering.plan_details;
  const planName = row.awarded ? row.awarded.plan_name : requestedPlan?.name;
  const planChanged =
    row.change === 'changed' &&
    requestedPlan?.name &&
    planName &&
    requestedPlan.name !== planName;
  return (
    <div className="d-flex flex-column gap-1 align-items-start">
      <span
        className={
          row.change === 'removed'
            ? 'text-muted text-decoration-line-through'
            : undefined
        }
      >
        {offering.offering_name}
      </span>
      {planName && (
        <span className="text-muted fs-7">
          {planChanged
            ? translate('Plan: {plan} (requested {requested})', {
                plan: planName,
                requested: requestedPlan.name,
              })
            : translate('Plan: {plan}', { plan: planName })}
        </span>
      )}
      {row.change === 'moved' && (
        <span className="text-muted fs-7">
          {translate('Requested on {offering}', {
            offering: row.requested.requested_offering.offering_name,
          })}
        </span>
      )}
      <AwardChangeBadge change={row.change} />
    </div>
  );
};

const formatAmount = (value: number | undefined, unit?: string) =>
  value === undefined || value === null
    ? translate('none')
    : unit
      ? `${value} ${unit}`
      : String(value);

/**
 * Awarded amounts per component, with the requested figure beside any that
 * differs. An item moved to another offering has different components, so
 * the request is then listed on its own line rather than component by
 * component.
 */
export const AwardAmountsCell: FC<{ row: AwardComparisonRow }> = ({ row }) => {
  const { awarded, requested } = row;
  const source = awarded ?? requested;
  const components = getRequestableComponents(source.requested_offering);
  if (!components.length) {
    return <>{renderFieldOrDash(null)}</>;
  }
  const awardedLimits = awarded ? getRowLimits(awarded) : {};
  const requestedLimits = requested ? getRowLimits(requested) : {};
  const sameOffering =
    awarded &&
    requested &&
    awarded.requested_offering.uuid === requested.requested_offering.uuid;

  if (!awarded) {
    return (
      <div className="d-flex flex-column gap-1 text-muted">
        {components.map((component) => (
          <span key={component.type}>
            {component.name}:{' '}
            {formatAmount(
              requestedLimits[component.type],
              component.measured_unit,
            )}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-1">
      {components.map((component) => {
        const value = awardedLimits[component.type];
        const asked = requestedLimits[component.type];
        const differs =
          sameOffering && Number(value ?? 0) !== Number(asked ?? 0);
        return (
          <span key={component.type}>
            {component.name}:{' '}
            <span className={differs ? 'fw-bold' : undefined}>
              {formatAmount(value, component.measured_unit)}
            </span>
            {differs && (
              // Its own line, so a narrow column wraps between the figures
              // rather than inside one.
              <span className="d-block text-muted fs-7">
                {translate('requested {amount}', {
                  amount: formatAmount(asked, component.measured_unit),
                })}
              </span>
            )}
          </span>
        );
      })}
      {requested && !sameOffering && (
        <span className="text-muted fs-7">
          {translate('Requested:')}{' '}
          {getRequestableComponents(requested.requested_offering).map(
            (component, index) => (
              <Fragment key={component.type}>
                {index > 0 && ', '}
                {component.name}{' '}
                {formatAmount(
                  requestedLimits[component.type],
                  component.measured_unit,
                )}
              </Fragment>
            ),
          )}
        </span>
      )}
      {!hasRequestedAmount(awarded) && (
        <span className="text-danger fs-7">
          {translate('No amount awarded yet.')}
        </span>
      )}
    </div>
  );
};
