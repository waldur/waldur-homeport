import { FC, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';

import { WizardFormContainer } from '@waldur/form/WizardFormContainer';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
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
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { ResourceRequestWizardFormFirstPage } from './ResourceRequestWizardFormFirstPage';
import { ResourceRequestWizardFormSecondPage } from './ResourceRequestWizardFormSecondPage';
import { ResourceRequestWizardFormThirdPage } from './ResourceRequestWizardFormThirdPage';

interface OwnProps {
  resolve: {
    proposal: Proposal;
    resourceRequest?: ProposalResource;
    refetch(): void;
  };
}

const WizardForms = [
  ResourceRequestWizardFormFirstPage,
  ResourceRequestWizardFormSecondPage,
  ResourceRequestWizardFormThirdPage,
];

const steps = [
  translate('Select offering'),
  translate('Configure request'),
  translate('Additional configuration'),
];

export const ResourceRequestFormDialog: FC<OwnProps> = (props) => {
  const callback = useCallback(
    (formData: ProposalResourceFormData, dispatch, formProps) => {
      const attributes = {};
      if (formData.attributes) {
        Object.assign(attributes, formData.attributes);
      }
      if (formData.limits) {
        Object.assign(attributes, { limits: formData.limits });
      }
      const payload = {
        requested_offering_uuid: formData.offering.requested_offering_uuid,
        attributes,
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

  /** Auto filling `mainOffering` in step 2 */
  const mainOffering: Offering = useSelector((state) =>
    formValueSelector('ProposalResourceForm')(state, 'mainOffering'),
  );

  const WizardStepsData = useMemo(() => {
    return mainOffering?.options?.order?.length
      ? { steps, wizardForms: WizardForms }
      : {
          steps: steps.slice(0, 2),
          wizardForms: WizardForms.slice(0, 2),
        };
  }, [mainOffering]);

  return (
    <WizardFormContainer
      form="ProposalResourceForm"
      title={
        isEdit ? translate('Edit resource request') : translate('New resource')
      }
      submitLabel={isEdit ? translate('Edit') : translate('Create')}
      onSubmit={callback}
      steps={WizardStepsData.steps}
      wizardForms={WizardStepsData.wizardForms}
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
              attributes: props.resolve.resourceRequest.attributes,
              limits: props.resolve.resourceRequest.attributes?.limits,
              plan: props.resolve.resourceRequest.requested_offering
                .plan_details,
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
