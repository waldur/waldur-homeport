import { FC, useCallback } from 'react';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import {
  createProposalResource,
  updateProposalResource,
} from '@waldur/proposals/api';
import {
  Proposal,
  ProposalResource,
  ProposalResourceFormData,
} from '@waldur/proposals/types';
import { CallOfferingCreateForm } from '@waldur/proposals/update/offerings/CallOfferingCreateForm';
import { WizardFormSecondPage } from '@waldur/proposals/update/offerings/WizardFormSecondPage';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { ResourceRequestWizardFormFirstPage } from './ResourceRequestWizardFormFirstPage';

interface OwnProps {
  resolve: {
    proposal: Proposal;
    resourceRequest?: ProposalResource;
    refetch(): void;
  };
}

const WizardForms = [ResourceRequestWizardFormFirstPage, WizardFormSecondPage];

const steps = [translate('Select offering'), translate('Configure request')];

export const ResourceRequestFormDialog: FC<OwnProps> = (props) => {
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
      if (props.resolve.resourceRequest) {
        // Edit
        return updateProposalResource(
          payload,
          props.resolve.proposal.uuid,
          props.resolve.resourceRequest.uuid,
        )
          .then(() => {
            dispatch(
              showSuccess(translate('Resource request has been updated.')),
            );
            formProps.destroy();
            dispatch(closeModalDialog());
            props.resolve.refetch();
          })
          .catch((error) => {
            dispatch(
              showErrorResponse(error, translate('Something went wrong')),
            );
          });
      } else {
        // Create new
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
            dispatch(
              showErrorResponse(error, translate('Something went wrong')),
            );
          });
      }
    },
    [props.resolve],
  );

  const isEdit = Boolean(props.resolve.resourceRequest);

  return (
    <CallOfferingCreateForm
      title={
        isEdit ? translate('Edit resource request') : translate('New resource')
      }
      submitLabel={isEdit ? translate('Edit') : translate('Create')}
      onSubmit={callback}
      steps={steps}
      wizardForms={WizardForms}
      initialValues={
        isEdit
          ? {
              offering: {
                attributes:
                  props.resolve.resourceRequest.requested_offering.attributes,
                customer_name:
                  props.resolve.resourceRequest.requested_offering
                    .provider_name,
                name: props.resolve.resourceRequest.requested_offering
                  .offering_name,
                requested_offering_uuid:
                  props.resolve.resourceRequest.requested_offering.uuid,
                url: props.resolve.resourceRequest.requested_offering.offering,
                uuid: props.resolve.resourceRequest.requested_offering
                  .offering_uuid,
              },
              limits: props.resolve.resourceRequest.attributes?.limits,
              plan: props.resolve.resourceRequest.requested_offering.plan,
            }
          : {}
      }
      data={{
        call: {
          uuid: props.resolve.proposal.call_uuid,
          name: props.resolve.proposal.call_name,
        },
      }}
    />
  );
};
