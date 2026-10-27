import { useMemo } from 'react';

import { translate } from '@/i18n';
import { OrderSummaryButton } from '@/marketplace/details/OrderSummaryButton';
import { PlanDescriptionButton } from '@/marketplace/details/plan/PlanDescriptionButton';
import { PlanSelectField } from '@/marketplace/details/plan/PlanSelectField';
import { PlanSpendingLimits } from '@/marketplace/details/plan/PlanSpendingLimits';
import { TabbedPlanComponents } from '@/marketplace/details/plan/TabbedPlanComponents';
import { getOrderablePlans } from '@/marketplace/offerings/details/planPricing';
import { VStepperFormStepCard } from '@/wizard';

import { useOrderFormData } from '../selectors';
import { FormStepProps } from '../types';

export const FormPlanStep = (props: FormStepProps) => {
  const plans = useMemo(
    () => getOrderablePlans(props.offering),
    [props.offering],
  );

  const { customer } = useOrderFormData();
  const concealBillingInfo =
    customer?.display_billing_info_in_projects === false;

  if (plans.length === 0) {
    return null;
  }
  return (
    <VStepperFormStepCard
      title={translate('Plan')}
      id={props.id}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
      actions={
        !props.previewMode && (
          <OrderSummaryButton
            offering={props.offering}
            className="ms-auto"
            disabled={props.disabled}
            disabledReason={props.disabledTooltip}
          />
        )
      }
    >
      <div className="flex gap-5 mb-4">
        <div className="grow">
          <PlanSelectField plans={plans} offering={props.offering} />
        </div>
        <PlanDescriptionButton size="md" />
      </div>
      <TabbedPlanComponents
        offering={props.offering}
        concealBillingInfo={concealBillingInfo}
        readOnlyLimits={props.params?.readOnlyLimits}
      />
      <PlanSpendingLimits offering={props.offering} />
    </VStepperFormStepCard>
  );
};
