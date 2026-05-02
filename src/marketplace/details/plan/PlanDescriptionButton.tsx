import { EyeIcon } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { ORDER_FORM_ID } from '@/marketplace/details/constants';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

interface PlanDescriptionButtonProps {
  planDescription?: string;
  className?: string;
  formId?: string;
}

const PlanDescription = lazyComponent(() =>
  import('./PlanDescription').then((module) => ({
    default: module.PlanDescription,
  })),
);

export const PlanDescriptionButton = (props: PlanDescriptionButtonProps) => {
  const { openDialog } = useModal();
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

  const handleClick = () =>
    openDialog(PlanDescription, {
      resolve: { plan_description: planDescription },
      size: 'lg',
    });

  return (
    <ActionButton
      title={translate('View details')}
      action={handleClick}
      iconNode={<EyeIcon weight="bold" />}
      className={props.className}
    />
  );
};
