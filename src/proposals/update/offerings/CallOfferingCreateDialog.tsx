import { FC, useCallback } from 'react';
import { proposalProtectedCallsOfferingsSet } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call, CallOfferingFormData } from '@/proposals/types';
import { ProgressStep, WizardFormContainer } from '@/wizard';

import { WizardFormFirstPage } from './WizardFormFirstPage';
import { WizardFormSecondPage } from './WizardFormSecondPage';
import { WizardFormThirdPage } from './WizardFormThirdPage';

interface CallOfferingCreateDialogProps {
  resolve: {
    call: Call;
    refetch(): void;
  };
}

const WizardForms = [
  WizardFormFirstPage,
  WizardFormSecondPage,
  WizardFormThirdPage,
];

const steps: ProgressStep[] = [
  {
    key: 'offering',
    label: translate('Select offering'),
    completed: false,
  },
  {
    key: 'configure',
    label: translate('Configure request'),
    completed: false,
  },
  { key: 'submit', label: translate('Submit'), completed: false },
];

export const CallOfferingCreateDialog: FC<CallOfferingCreateDialogProps> = (
  props,
) => {
  const { closeDialog } = useModal();

  const createOfferingMutation = useManagedMutation<
    any,
    any,
    { formData: CallOfferingFormData }
  >({
    mutationFn: (args) => {
      const { formData } = args;
      const updated_plan_url = `${ENV.apiEndpoint}api/marketplace-plans/${formData.plan.uuid}/`;
      return proposalProtectedCallsOfferingsSet({
        path: { uuid: props.resolve.call.uuid },
        body: {
          offering: formData.offering.url,
          description: formData.description,
          plan: updated_plan_url,
          attributes: formData.limits
            ? {
                limits: formData.limits,
              }
            : {},
        },
      });
    },
    successMessage: translate('Offering request has been submitted.'),
    errorMessage: translate('Something went wrong'),
    refetch: props.resolve.refetch,
    onSuccess: () => {
      closeDialog();
    },
  });

  const createRound = useCallback(
    (formData) => createOfferingMutation.mutateAsync({ formData }),
    [createOfferingMutation],
  );
  return (
    <WizardFormContainer
      form="CallOfferingForm"
      title={translate('New offering')}
      submitLabel={translate('Create')}
      onSubmit={createRound}
      steps={steps}
      wizardForms={WizardForms}
      data={{ call: props.resolve.call }}
    />
  );
};
