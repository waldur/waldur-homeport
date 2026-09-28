import { EyeIcon } from '@phosphor-icons/react';
import { useFormState } from 'react-final-form';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { DeployFormData } from '@/marketplace/common/types';
import { useModal } from '@/modal/actions';

interface PlanDescriptionButtonProps {
  planDescription?: string;
}

const PlanDescription = lazyComponent(() =>
  import('./PlanDescription').then((module) => ({
    default: module.PlanDescription,
  })),
);

export const PlanDescriptionButton = (props: PlanDescriptionButtonProps) => {
  const { openDialog } = useModal();
  const formState = useFormState<DeployFormData>({
    subscription: { values: true },
  });

  let planDescription = '';
  if (formState?.values?.plan?.description) {
    planDescription = (formState.values.plan.description as string).trim();
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
    <BaseButton
      label={translate('View details')}
      onClick={handleClick}
      iconNode={<EyeIcon weight="bold" />}
      variant="tertiary"
      size="lg"
    />
  );
};
