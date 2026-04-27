import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { ENV } from '@/core/config';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { orderProjectSelector } from '@/marketplace/deploy/selectors';
import { OrderStartDateField } from '@/marketplace/deploy/steps/OrderStartDateField';
import { concealPricesSelector } from '@/marketplace/deploy/utils';

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
  offering,
}) => {
  const shouldConcealPrices =
    useSelector(concealPricesSelector) || concealBillingInfo;
  const project = useSelector(orderProjectSelector);

  const prepaidConstraints = useMemo(
    () => mergePrepaidConstraints(oneTime.prepaidRows),
    [oneTime.prepaidRows],
  );

  const showStartDateHere =
    oneTime.prepaidRows.length > 0 &&
    !viewMode &&
    ENV.plugins.WALDUR_CORE.ENABLE_ORDER_START_DATE;

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
          <PrepaidRows
            components={oneTime.prepaidRows}
            overageComponents={oneTime.overageRows}
          />
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
            offering={offering}
          />
        )}

        {showStartDateHere && (
          <FormTable.Item
            label={translate('Start date')}
            tooltip={translate(
              'If not set, the order is processed immediately after approval.',
            )}
            value={<OrderStartDateField project={project} simple />}
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
