import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import FormTable from '@waldur/form/FormTable';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { concealPricesSelector } from '@waldur/marketplace/deploy/utils';

import { ComponentRowTotal } from './ComponentRowTotal';
import { ControlRows } from './ControlRows';
import { FixedRows } from './FixedRows';
import { PlanDetailsTableProps, PlanPeriod } from './types';
import { UsageRows } from './UsageRows';

export const PeriodicTab = ({
  periodic,
  customer,
  periodKeys,
  periods,
  viewMode,
}: { periodic; customer } & Pick<
  PlanDetailsTableProps,
  'periodKeys' | 'periods' | 'viewMode'
>) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PlanPeriod>('monthly');

  const activeFixedPriceProfile =
    customer && getActiveFixedPricePaymentProfile(customer.payment_profiles);

  const shouldConcealPrices =
    useSelector(concealPricesSelector) ||
    customer?.display_billing_info_in_projects === false;

  const activePriceIndex = useMemo(
    () => periodKeys.indexOf(selectedPeriod) ?? 0,
    [periodKeys, selectedPeriod],
  );

  return (
    <section className="plan-details-section">
      <FormTable>
        {/* Fixed */}
        {periodic.fixedRows.length > 0 && (
          <FixedRows
            components={periodic.fixedRows}
            hidePrices={Boolean(activeFixedPriceProfile || shouldConcealPrices)}
            period={selectedPeriod}
            activePriceIndex={activePriceIndex}
          />
        )}

        {/* Usage */}
        {periodic.usageRows.length > 0 && (
          <UsageRows
            components={periodic.usageRows}
            hidePrices={shouldConcealPrices}
            period={selectedPeriod}
          />
        )}

        {/* Limit */}
        {periodic.periodicLimitedRows.length > 0 && (
          <ControlRows
            components={periodic.periodicLimitedRows}
            hidePrices={Boolean(shouldConcealPrices)}
            viewMode={viewMode}
            period={selectedPeriod}
            activePriceIndex={activePriceIndex}
          />
        )}

        {!activeFixedPriceProfile && !shouldConcealPrices ? (
          <ComponentRowTotal
            amount={periodic.periodicTotal[activePriceIndex]}
            period={selectedPeriod}
            setPeriod={periods.length > 1 ? setSelectedPeriod : null}
          />
        ) : null}
      </FormTable>
    </section>
  );
};
