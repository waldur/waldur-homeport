import { FC, useCallback } from 'react';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { createProposalResource } from '@waldur/proposals/api';
import { Proposal, ProposalResourceFormData } from '@waldur/proposals/types';
import { CallOfferingCreateForm } from '@waldur/proposals/update/offerings/CallOfferingCreateForm';
import { WizardFormSecondPage } from '@waldur/proposals/update/offerings/WizardFormSecondPage';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { AddResourceWizardFormFirstPage } from './AddResourceWizardFormFirstPage';

interface AddResourceDialogProps {
  resolve: {
    proposal: Proposal;
    refetch(): void;
  };
}

const WizardForms = [AddResourceWizardFormFirstPage, WizardFormSecondPage];

const steps = [translate('Select offering'), translate('Configure request')];

export const AddResourceDialog: FC<AddResourceDialogProps> = (props) => {
  const callback = useCallback(
    (formData: ProposalResourceFormData, dispatch, formProps) => {
      const payload = {
        requested_offering_uuid: formData.offering.requested_offering_uuid,
        attributes: formData.limits
          ? {
              limits: formData.limits,
            }
          : {},
      };
      return createProposalResource(payload, props.resolve.proposal.uuid)
        .then(() => {
          dispatch(
            showSuccess(translate('Resource request has been submitted.')),
          );
          formProps.destroy();
          dispatch(closeModalDialog());
          props.resolve.refetch();
        })
        .catch((error) => {
          dispatch(showErrorResponse(error, translate('Something went wrong')));
        });
    },
    [props.resolve],
  );
  return (
    <CallOfferingCreateForm
      onSubmit={callback}
      steps={steps}
      wizardForms={WizardForms}
      data={{
        call: {
          uuid: props.resolve.proposal.call_uuid,
          name: props.resolve.proposal.call_name,
        },
      }}
    />
  );
};
