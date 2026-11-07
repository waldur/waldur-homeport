import { FC, Fragment, ReactNode } from 'react';

import { Badge, BadgeVariant, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { AwardComparisonRow } from '@/proposals/awardedResources';
import { MissingOptionsHint } from '@/proposals/MissingOptionsHint';
import {
  getRequestableComponents,
  getRowLimits,
  hasRequestedAmount,
} from '@/proposals/requestedResourceCost';
import { renderFieldOrDash } from '@/table/utils';

type AwardChange = Exclude<AwardComparisonRow['change'], 'unchanged'>;

const CHANGE_VARIANTS: Record<AwardChange, BadgeVariant> = {
  changed: 'warning',
  moved: 'info',
  added: 'success',
  removed: 'danger',
};

const changeLabel = (change: AwardChange) =>
  ({
    changed: translate('Changed'),
    moved: translate('Moved'),
    added: translate('Added'),
    removed: translate('Not awarded'),
  })[change];

/**
 * How an awarded item differs from the request. An item awarded as requested
 * gets no badge: the award is called out only where it differs.
 */
export const AwardChangeBadge: FC<{ change: AwardComparisonRow['change'] }> = ({
  change,
}) =>
  change === 'unchanged' ? null : (
    <Badge variant={CHANGE_VARIANTS[change]} shape="pill" tone="outline">
      {changeLabel(change)}
    </Badge>
  );

/**
 * Who changed an awarded item, for a change the applicant did not make: the
 * last to change it, or whoever added an item nobody requested.
 */
const getAwardAuthorLine = (row: AwardComparisonRow): string | null => {
  const awarded = row.awarded;
  if (!awarded) {
    return null;
  }
  if (awarded.modified_by_name) {
    return translate('Changed by {name}', { name: awarded.modified_by_name });
  }
  if (row.change === 'added' && awarded.created_by_name) {
    return translate('Added by {name}', { name: awarded.created_by_name });
  }
  return null;
};

/** The offering an item is awarded on, with the change badge where the
 * award differs from the request: one line for the table row. */
export const AwardOfferingCell: FC<{ row: AwardComparisonRow }> = ({ row }) => {
  const offering = (row.awarded ?? row.requested).requested_offering;
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={
          row.change === 'removed'
            ? 'text-quaternary line-through'
            : 'font-medium text-primary'
        }
      >
        {offering.offering_name}
      </span>
      <AwardChangeBadge change={row.change} />
    </span>
  );
};

/**
 * What the row leaves out, as the expanded row's key/value details: the
 * plan and the options it answers (a QoS), with what they were asked for
 * where they differ, the amounts, where a moved item was requested and who
 * changed it.
 */
export const AwardDetails: FC<{
  row: AwardComparisonRow;
  /** Only where the award can be edited: elsewhere nobody can answer it. */
  showMissingOptions?: boolean;
  children?: ReactNode;
}> = ({ row, showMissingOptions, children }) => {
  const requestedPlan = row.requested?.requested_offering.plan_details;
  const planName = row.awarded ? row.awarded.plan_name : requestedPlan?.name;
  const planChanged =
    row.change === 'changed' &&
    requestedPlan?.name &&
    planName &&
    requestedPlan.name !== planName;
  const author = getAwardAuthorLine(row);
  return (
    <>
      {planName && (
        <PropertyItem
          label={translate('Plan')}
          value={
            planChanged
              ? translate('{plan} (requested {requested})', {
                  plan: planName,
                  requested: requestedPlan.name,
                })
              : planName
          }
        />
      )}
      {(row.optionLines ?? []).map((line) => (
        <PropertyItem
          key={line.key}
          label={line.label}
          value={
            'requested' in line
              ? translate('{value} (requested {requested})', {
                  value: line.value ?? translate('none'),
                  requested: line.requested ?? translate('none'),
                })
              : line.value
          }
        />
      ))}
      <PropertyItem
        label={translate('Amounts')}
        value={<AwardAmountsCell row={row} />}
      />
      {row.change === 'moved' && (
        <PropertyItem
          label={translate('Requested on')}
          value={row.requested.requested_offering.offering_name}
        />
      )}
      {author && (
        <PropertyItem
          label={translate('Changed')}
          value={<span data-testid="award-author">{author}</span>}
        />
      )}
      {showMissingOptions && <MissingOptionsHint item={row.awarded} />}
      {children}
    </>
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
      <div className="flex flex-col gap-1 text-quaternary">
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
    <div className="flex flex-col gap-1">
      {components.map((component) => {
        const value = awardedLimits[component.type];
        const asked = requestedLimits[component.type];
        const differs =
          sameOffering && Number(value ?? 0) !== Number(asked ?? 0);
        return (
          <span key={component.type}>
            {component.name}:{' '}
            <span className={differs ? 'font-medium' : undefined}>
              {formatAmount(value, component.measured_unit)}
            </span>
            {differs && (
              // Its own line, so a narrow column wraps between the figures
              // rather than inside one.
              <span className="block text-quaternary text-xs">
                {translate('requested {amount}', {
                  amount: formatAmount(asked, component.measured_unit),
                })}
              </span>
            )}
          </span>
        );
      })}
      {requested && !sameOffering && (
        <span className="text-quaternary text-xs">
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
        <span className="text-danger text-xs">
          {translate('No amount awarded yet.')}
        </span>
      )}
    </div>
  );
};
