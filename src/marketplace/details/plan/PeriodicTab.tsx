import { useMemo, useState } from 'react';
import { LimitPeriodEnum } from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import FormTable from '@/form/FormTable';
import { getActiveFixedPricePaymentProfile } from '@/invoices/details/utils';

import { ComponentRowTotal } from './ComponentRowTotal';
import { ControlRows } from './ControlRows';
import { FixedRows } from './FixedRows';
import { PlanDetailsTableProps, PlanPeriod } from './types';
import { UsageRows } from './UsageRows';
import { useComponentsDetailPrices } from './utils';

export const PeriodicTab = ({
  periodic,
  limitPeriod,
  customer,
  periodKeys,
  periods,
  viewMode,
  concealBillingInfo = false,
  offering,
}: {
  periodic: ReturnType<typeof useComponentsDetailPrices>['periodic'];
  customer;
  /** If set, only render components of this period (fixed & usage components are also rendered for monthly period) */
  limitPeriod?: LimitPeriodEnum;
  concealBillingInfo?: boolean;
} & Pick<
  PlanDetailsTableProps,
  'periodKeys' | 'periods' | 'viewMode' | 'offering'
>) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PlanPeriod>('monthly');

  const activeFixedPriceProfile =
    customer && getActiveFixedPricePaymentProfile(customer.payment_profiles);

  const shouldConcealPrices =
    isFeatureVisible(MarketplaceFeatures.conceal_prices) ||
    concealBillingInfo ||
    customer?.display_billing_info_in_projects === false;

  const activePriceIndex = useMemo(() => {
    const index = periodKeys.indexOf(selectedPeriod);
    return index > -1 ? index : 0;
  }, [periodKeys, selectedPeriod]);

  /**
   * Total amount for the selected limitPeriod.
   * If limitPeriod is set, uses limitedRowsByPeriod; otherwise uses periodic.total.
   * For now, fixed-price totals are always shown for the monthly period (or if period is not set).
   */
  const totalPeriods = useMemo(() => {
    if (!limitPeriod) {
      return periodic.totalPeriods;
    }
    if (limitPeriod === 'month') {
      return periodic.totalPeriods.map(
        (_, i) =>
          (periodic.limitedRowsByPeriod[limitPeriod].totalPeriods[i] ?? 0) +
          (periodic.fixedTotalPeriods[i] ?? 0),
      );
    }
    return periodic.limitedRowsByPeriod[limitPeriod].totalPeriods;
  }, [limitPeriod, periodic]);

  return (
    <section className="plan-details-section">
      <FormTable>
        {!limitPeriod ||
          (limitPeriod === 'month' && (
            <>
              {/* Fixed */}
              {periodic.fixedRows.length > 0 && (
                <FixedRows
                  components={periodic.fixedRows}
                  hidePrices={Boolean(
                    activeFixedPriceProfile || shouldConcealPrices,
                  )}
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
            </>
          ))}

        {/* Limit */}
        {periodic.limitedRows.length > 0 && (
          <ControlRows
            components={
              !limitPeriod
                ? periodic.limitedRows
                : periodic.limitedRowsByPeriod[limitPeriod].rows
            }
            hidePrices={Boolean(shouldConcealPrices)}
            viewMode={viewMode}
            period={selectedPeriod}
            activePriceIndex={activePriceIndex}
            offering={offering}
          />
        )}

        {!activeFixedPriceProfile && !shouldConcealPrices ? (
          <ComponentRowTotal
            amount={totalPeriods[activePriceIndex]}
            period={selectedPeriod}
            setPeriod={periods.length > 1 ? setSelectedPeriod : null}
          />
        ) : null}
      </FormTable>
    </section>
  );
};
