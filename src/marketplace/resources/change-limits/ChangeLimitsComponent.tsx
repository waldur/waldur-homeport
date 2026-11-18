import { get } from 'es-toolkit/compat';
import React from 'react';
import { useFormState } from 'react-final-form';

import { Card } from 'waldur-ui';

import { translate } from '@/i18n';
import {
  getComponentsByType,
  getDerivedComponents,
  getDerivedLimitInputs,
  getPairedFormulaKeys,
} from '@/marketplace/common/derivedLimits';
import { useSyncDerivedLimits } from '@/marketplace/common/useSyncDerivedLimits';
import { SimpleTable } from '@/table/SimpleTable';

import { getLimitColumns, LimitTableRow } from './ComponentRow';
import { FetchedData, getLimitChangeData } from './utils';

interface ChangeLimitsComponentProps {
  data: FetchedData;
  orderCanBeApproved: boolean;
  /** For nested fields */
  parentName?: string;
  /**
   * The formula inputs to derive limits from, when they are being changed;
   * by default the resource's current ones.
   */
  inputs?: Record<string, unknown>;
  /** Show the limits without inputs: a preview of what `inputs` derive. */
  readOnly?: boolean;
}

export const ChangeLimitsComponent: React.FC<ChangeLimitsComponentProps> = ({
  data,
  orderCanBeApproved,
  parentName,
  inputs,
  readOnly,
}) => {
  const { values } = useFormState({ subscription: { values: true } });
  const limitsName = parentName ? `${parentName}.limits` : 'limits';
  const options = data.offering.options?.options;
  const derivedTypes = React.useMemo(
    () => getDerivedComponents(options),
    [options],
  );
  const components = React.useMemo(
    () => getComponentsByType(data.offering.components),
    [data.offering],
  );
  // Only a formula paired with a resource option can be changed after
  // ordering; without one the hint would point at nothing.
  const hasPairedOption = getPairedFormulaKeys(data.offering).length > 0;
  const formLimits = get(values, limitsName);
  // A preview has no inputs of its own: what it does not derive stays as is.
  const newLimits = React.useMemo(
    () => (readOnly ? { ...data.limits, ...formLimits } : formLimits || {}),
    [readOnly, data.limits, formLimits],
  );
  const currentInputs = React.useMemo(
    () => getDerivedLimitInputs(data.resource, data.offering),
    [data.resource, data.offering],
  );
  // The server recalculates derived limits from the resource's current inputs;
  // doing the same here keeps the difference and price honest.
  useSyncDerivedLimits({
    options,
    attributes: inputs ?? currentInputs,
    limits: newLimits,
    components,
    fallback: data.limits,
    name: limitsName,
  });
  const limitChangeData = React.useMemo(
    () =>
      getLimitChangeData(
        data.plan,
        data.offering,
        newLimits,
        data.limits,
        data.usages,
        orderCanBeApproved,
        data.concealBillingInfo,
        data.resource.end_date,
      ),
    [data, newLimits, orderCanBeApproved],
  );

  const columns = React.useMemo(
    () =>
      getLimitColumns({
        shouldConcealPrices: limitChangeData.shouldConcealPrices,
        limits: data.offeringLimits,
        parentName,
        derivedTypes,
        readOnly,
      }),
    [
      limitChangeData.shouldConcealPrices,
      data.offeringLimits,
      parentName,
      derivedTypes,
      readOnly,
    ],
  );
  const rows: LimitTableRow[] = [
    ...limitChangeData.components.map((component) => ({
      uuid: component.type,
      component,
    })),
    ...(limitChangeData.shouldConcealPrices
      ? []
      : limitChangeData.periodTotals.map((total) => ({
          uuid: `total-${total.chargeMode}`,
          total,
        }))),
  ];

  return (
    <div>
      {!readOnly && hasPairedOption ? (
        <p className="text-quaternary">
          {translate(
            'Limits calculated from the options follow them: change an option on the Options tab to change them.',
          )}
        </p>
      ) : null}
      {data.plan ? (
        <p>
          <strong>{translate('Current plan')}</strong>: {data.plan.name}
        </p>
      ) : (
        <p>{translate('Resource does not have any plan.')}</p>
      )}
      {/* Shares the block with the plan line above, so it carries a border. */}
      <Card variant="table" bordered>
        <SimpleTable<LimitTableRow> columns={columns} rows={rows} />
      </Card>
    </div>
  );
};
