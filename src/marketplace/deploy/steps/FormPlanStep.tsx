import { useMemo } from 'react';
import { useEffectOnce } from 'react-use';

import { translate } from '@waldur/i18n';
import { PlanDescriptionButton } from '@waldur/marketplace/details/plan/PlanDescriptionButton';
import { PlanDetailsTable2 } from '@waldur/marketplace/details/plan/PlanDetailsTable2';
import { PlanSelectField } from '@waldur/marketplace/details/plan/PlanSelectField';

import { FormStepProps } from '../types';

import { StepCard } from './StepCard';

export const FormPlanStep = (props: FormStepProps) => {
  const plans = useMemo(
    () => props.offering.plans.filter((plan) => plan.archived === false),
    [props.offering],
  );

  // Initialize plan if we have only one choice
  useEffectOnce(() => {
    if (plans && plans.length === 1) {
      props.change('plan', plans[0]);
    }
  });

  if (props.offering.plans.length === 0) {
    return null;
  }
  return (
    <StepCard
      title={translate('Plan')}
      step={props.step}
      id={props.id}
      completed={props.observed}
    >
      <div className="d-flex gap-6 pb-6 border-bottom mb-7">
        <div className="flex-grow-1">
          <PlanSelectField plans={plans} />
        </div>
        <PlanDescriptionButton />
      </div>
      <PlanDetailsTable2 offering={props.offering} />
    </StepCard>
  );
};
