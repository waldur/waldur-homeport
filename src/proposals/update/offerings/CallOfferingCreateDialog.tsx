import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { proposalProtectedCallsOfferingsSet } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { ProgressStep } from '@/core/ProgressSteps';
import { WizardFormContainer } from '@/form/WizardFormContainer';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { Call, CallOfferingFormData } from '@/proposals/types';
import { showErrorResponse, showSuccess } from '@/store/notify';

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
  const dispatch = useDispatch();
  const createRound = useCallback(
    async (formData: CallOfferingFormData, _dispatch, formProps) => {
      try {
        const updated_plan_url = `${ENV.apiEndpoint}api/marketplace-plans/${formData.plan.uuid}/`;
        await proposalProtectedCallsOfferingsSet({
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
        dispatch(
          showSuccess(translate('Offering request has been submitted.')),
        );
        formProps.destroy();
        dispatch(closeModalDialog());
        props.resolve.refetch();
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Something went wrong')));
      }
    },
    [dispatch, props.resolve],
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
