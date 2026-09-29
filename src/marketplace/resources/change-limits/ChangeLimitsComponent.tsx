import { get } from 'lodash-es';
import React from 'react';
import { Card } from 'react-bootstrap';
import { useFormState } from 'react-final-form';

import { translate } from '@/i18n';
import {
  getComponentsByType,
  getDerivedComponents,
  getDerivedLimitInputs,
  getPairedFormulaKeys,
} from '@/marketplace/common/derivedLimits';
import { useSyncDerivedLimits } from '@/marketplace/common/useSyncDerivedLimits';
import { PriceTooltip } from '@/price/PriceTooltip';

import { ComponentRow } from './ComponentRow';
import { ComponentTotalRow } from './ComponentTotalRow';
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
  const { values } = useFormState();
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

  return (
    <div>
      {!readOnly && hasPairedOption ? (
        <p className="text-muted">
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
      <Card className="card-table card-bordered full-width">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <div className="table-container">
              <table className="table table-row-bordered align-middle">
                <thead>
                  <tr className="align-middle">
                    <th>{translate('Component')}</th>
                    <th>{translate('Usage')}</th>
                    <th>{translate('Current limit')}</th>
                    <th>{translate('New limit')}</th>
                    <th>{translate('Difference')}</th>
                    {limitChangeData.shouldConcealPrices ? null : (
                      <th className="col-sm-2">
                        {translate('Price')}
                        <PriceTooltip />
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {limitChangeData.components.map((component, index) => (
                    <ComponentRow
                      key={index}
                      component={component}
                      limits={data.offeringLimits[component.type]}
                      shouldConcealPrices={limitChangeData.shouldConcealPrices}
                      parentName={parentName}
                      derived={derivedTypes.has(component.type)}
                      readOnly={readOnly}
                    />
                  ))}
                </tbody>
                {limitChangeData.shouldConcealPrices ||
                limitChangeData.periodTotals.length === 0 ? null : (
                  <tfoot>
                    {limitChangeData.periodTotals.map((row) => (
                      <ComponentTotalRow key={row.chargeMode} row={row} />
                    ))}
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};
