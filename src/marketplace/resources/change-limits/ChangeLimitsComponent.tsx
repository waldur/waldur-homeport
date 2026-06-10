import React from 'react';
import { Card } from 'react-bootstrap';
import { useFormState } from 'react-final-form';

import { translate } from '@/i18n';
import { PriceTooltip } from '@/price/PriceTooltip';

import { ComponentRow } from './ComponentRow';
import { ComponentTotalRow } from './ComponentTotalRow';
import { FetchedData, getLimitChangeData } from './utils';

interface ChangeLimitsComponentProps {
  data: FetchedData;
  orderCanBeApproved: boolean;
  /** For nested fields */
  parentName?: string;
}

export const ChangeLimitsComponent: React.FC<ChangeLimitsComponentProps> = ({
  data,
  orderCanBeApproved,
  parentName,
}) => {
  const { values } = useFormState();
  const limitChangeData = React.useMemo(
    () =>
      getLimitChangeData(
        data.plan,
        data.offering,
        values.limits || {},
        data.limits,
        data.usages,
        orderCanBeApproved,
        data.concealBillingInfo,
        data.resource.end_date,
      ),
    [data, values.limits, orderCanBeApproved],
  );

  return (
    <div>
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
