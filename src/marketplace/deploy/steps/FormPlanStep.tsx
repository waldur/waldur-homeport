import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { OrderSummaryButton } from '@waldur/marketplace/details/OrderSummaryButton';
import { PlanDescriptionButton } from '@waldur/marketplace/details/plan/PlanDescriptionButton';
import { PlanSelectField } from '@waldur/marketplace/details/plan/PlanSelectField';
import { TabbedPlanComponents } from '@waldur/marketplace/details/plan/TabbedPlanComponents';

import { orderCustomerSelector } from '../selectors';
import { FormStepProps } from '../types';

export const FormPlanStep = (props: FormStepProps) => {
  const plans = useMemo(
    () => props.offering.plans.filter((plan) => plan.archived === false),
    [props.offering],
  );

  const customer = useSelector(orderCustomerSelector);
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
          />
        )
      }
    >
      <div className="d-flex gap-6 mb-5">
        <div className="flex-grow-1">
          <PlanSelectField plans={plans} />
        </div>
        <PlanDescriptionButton />
      </div>
      <TabbedPlanComponents
        offering={props.offering}
        concealBillingInfo={concealBillingInfo}
      />
    </VStepperFormStepCard>
  );
};
