import { FC, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';
import {
  proposalProposalsResourcesPartialUpdate,
  proposalProposalsResourcesSet,
} from 'waldur-js-client';

import { ProgressStep } from '@/core/ProgressSteps';
import { WizardFormContainer } from '@/form/WizardFormContainer';
import { translate } from '@/i18n';
import { Offering } from '@/marketplace/types';
import { closeModalDialog } from '@/modal/actions';
import {
  Proposal,
  ProposalResource,
  ProposalResourceFormData,
} from '@/proposals/types';
import { showErrorResponse, showSuccess } from '@/store/notify';

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

const steps: ProgressStep[] = [
  { key: 'offering', label: translate('Select offering'), completed: false },
  { key: 'configure', label: translate('Configure request'), completed: false },
  {
    key: 'additional',
    label: translate('Additional configuration'),
    completed: false,
  },
];

export const ResourceRequestFormDialog: FC<OwnProps> = (props) => {
  const callback = useCallback(
    async (formData: ProposalResourceFormData, dispatch, formProps) => {
      const attributes = {};
      if (formData.attributes) {
        Object.assign(attributes, formData.attributes);
      }
      if (formData.limits) {
        Object.assign(attributes, { limits: formData.limits });
      }
      const payload = {
        requested_offering_uuid: formData.offering.uuid,
        attributes,
      };
      if (props.resolve.resourceRequest) {
        // Edit
        try {
          await proposalProposalsResourcesPartialUpdate({
            path: {
              uuid: props.resolve.proposal.uuid,
              obj_uuid: props.resolve.resourceRequest.uuid,
            },
            body: payload,
          });
          dispatch(
            showSuccess(translate('Resource request has been updated.')),
          );
          formProps.destroy();
          dispatch(closeModalDialog());
          props.resolve.refetch();
        } catch (error) {
          dispatch(showErrorResponse(error, translate('Something went wrong')));
        }
      } else {
        // Create new
        try {
          await proposalProposalsResourcesSet({
            path: { uuid: props.resolve.proposal.uuid },
            body: payload,
          });
          dispatch(
            showSuccess(translate('Resource request has been submitted.')),
          );
          formProps.destroy();
          dispatch(closeModalDialog());
          props.resolve.refetch();
        } catch (error) {
          dispatch(showErrorResponse(error, translate('Something went wrong')));
        }
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
              offering: { ...props.resolve.resourceRequest.requested_offering },
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
