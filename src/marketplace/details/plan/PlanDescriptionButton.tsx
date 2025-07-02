import { EyeIcon } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';
import { ORDER_FORM_ID } from '@waldur/marketplace/details/constants';
import { showOfferingPlanDescription } from '@waldur/marketplace/details/plan/actions';
import { ActionButton } from '@waldur/table/ActionButton';

interface PlanDescriptionButtonProps {
  planDescription?: string;
  className?: string;
  formId?: string;
}

export const PlanDescriptionButton = (props: PlanDescriptionButtonProps) => {
  const dispatch = useDispatch();
  const formData = useSelector(
    getFormValues(props.formId || ORDER_FORM_ID),
  ) as { plan: { description } };

  let planDescription = '';
  if (formData && formData.plan && formData.plan.description) {
    planDescription = (formData.plan.description as string).trim();
  }
  if (props.planDescription) {
    planDescription = props.planDescription.trim();
  }
  if (!planDescription) {
    return null;
  }

  const handleClick = () => {
    dispatch(showOfferingPlanDescription(planDescription));
  };

  return (
    <ActionButton
      title={translate('View details')}
      action={handleClick}
      iconNode={<EyeIcon weight="bold" />}
      className={props.className}
    />
  );
};
