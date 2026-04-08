import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import FormTable from '@waldur/form/FormTable';
import { concealPricesSelector } from '@waldur/marketplace/deploy/utils';

import { ComponentRowTotal } from './ComponentRowTotal';
import { ControlRows } from './ControlRows';
import { FixedRows } from './FixedRows';
import { mergePrepaidConstraints } from './prepaidConstraints';
import { PrepaidDurationSelector } from './PrepaidDurationSelector';
import { PrepaidRows } from './PrepaidRows';

export const OneTimeTab = ({
  oneTime,
  viewMode,
  concealBillingInfo = false,
}) => {
  const shouldConcealPrices =
    useSelector(concealPricesSelector) || concealBillingInfo;

  const prepaidConstraints = useMemo(
    () => mergePrepaidConstraints(oneTime.prepaidRows),
    [oneTime.prepaidRows],
  );

  return (
    <section className="plan-details-section">
      <FormTable>
        {/* One */}
        {oneTime.initialRows.length > 0 && (
          <FixedRows
            components={oneTime.initialRows}
            hidePrices={shouldConcealPrices}
            activePriceIndex={0}
          />
        )}

        {oneTime.prepaidRows.length > 0 && (
          <PrepaidRows components={oneTime.prepaidRows} />
        )}

        {/* Few */}
        {oneTime.switchRows.length > 0 && (
          <FixedRows
            components={oneTime.switchRows}
            hidePrices={shouldConcealPrices}
            activePriceIndex={0}
          />
        )}

        {/* Limit */}
        {oneTime.totalLimitedRows.length > 0 && (
          <ControlRows
            components={oneTime.totalLimitedRows}
            hidePrices={Boolean(shouldConcealPrices)}
            viewMode={viewMode}
            activePriceIndex={0}
          />
        )}

        {oneTime.prepaidRows.length > 0 && !viewMode && (
          <PrepaidDurationSelector
            constraints={prepaidConstraints}
            components={oneTime.prepaidRows}
          />
        )}

        {!shouldConcealPrices && (
          <ComponentRowTotal amount={oneTime.oneTimeTotal} />
        )}
      </FormTable>
    </section>
  );
};
