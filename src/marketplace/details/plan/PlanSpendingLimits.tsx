import { useMemo } from 'react';
import { Offering, PublicOfferingDetails } from 'waldur-js-client';

import { translate } from '@/i18n';
import { SpendingLimitFields } from '@/marketplace/common/SpendingLimitFields';
import {
  getCappedComponents,
  getSpendingLimitsNotice,
  offersAllTimeLimit,
} from '@/marketplace/common/spendingLimits';
import { useOrderFormData } from '@/marketplace/deploy/selectors';

import { getEffectiveComponents } from './effectiveComponents';

/**
 * The order form's spending limits: one optional amount per period each
 * usage-based component offers, under the chosen plan. The provider's
 * defaults are the form's initial values (see DeployPage).
 */
export const PlanSpendingLimits = ({
  offering,
}: {
  offering: Offering | PublicOfferingDetails;
}) => {
  const { plan } = useOrderFormData();
  const components = useMemo(
    () => getCappedComponents(getEffectiveComponents(offering, plan)),
    [offering, plan],
  );

  if (components.length === 0) {
    return null;
  }

  return (
    <section className="mt-6" data-testid="plan-spending-limits">
      <h4 className="mb-1 text-base font-semibold text-primary">
        {translate('Spending limits')}
      </h4>
      <p className="mb-4 text-sm text-tertiary">
        {getSpendingLimitsNotice(
          offering.plugin_options?.action_on_usage_limit,
          offersAllTimeLimit(components),
        )}
      </p>
      <SpendingLimitFields components={components} />
    </section>
  );
};
