import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { fixURL } from '@waldur/core/api';
import { WizardFormContainer } from '@waldur/form/WizardFormContainer';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { createCallOffering } from '@waldur/proposals/api';
import { CallOfferingFormData, Call } from '@waldur/proposals/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

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

const steps = [
  translate('Select offering'),
  translate('Configure request'),
  translate('Submit'),
];

export const CallOfferingCreateDialog: FC<CallOfferingCreateDialogProps> = (
  props,
) => {
  const dispatch = useDispatch();
  const createRound = useCallback(
    (formData: CallOfferingFormData, _dispatch, formProps) => {
      const updated_plan_url = fixURL(
        `/marketplace-plans/${formData.plan.uuid}/`,
      );
      const payload = {
        offering: formData.offering.url,
        description: formData.description,
        plan: updated_plan_url,
        attributes: formData.limits
          ? {
              limits: formData.limits,
            }
          : {},
      };
      return createCallOffering(props.resolve.call.uuid, payload)
        .then(() => {
          dispatch(
            showSuccess(translate('Offering request has been submitted.')),
          );
          formProps.destroy();
          dispatch(closeModalDialog());
          props.resolve.refetch();
        })
        .catch((error) => {
          dispatch(showErrorResponse(error, translate('Something went wrong')));
        });
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
