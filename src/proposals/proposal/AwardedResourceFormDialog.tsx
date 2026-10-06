import { useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useMemo, useState } from 'react';
import {
  AwardedResource,
  proposalProposalsAwardedResourcesPartialUpdate,
  proposalProposalsAwardedResourcesSet,
} from 'waldur-js-client';

import { getUUID } from '@/core/utils';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import {
  awardedResourcesKey,
  pickOfferingLimits,
} from '@/proposals/awardedResources';
import { Proposal } from '@/proposals/types';
import { useNotify } from '@/store/notify';
import { ProgressStep, WizardFormContainer } from '@/wizard';

import { ResourceRequestWizardFormFirstPage } from './create/resource-requests-step/ResourceRequestWizardFormFirstPage';
import { ResourceRequestWizardFormSecondPage } from './create/resource-requests-step/ResourceRequestWizardFormSecondPage';
import { ResourceRequestWizardFormThirdPage } from './create/resource-requests-step/ResourceRequestWizardFormThirdPage';

interface AwardedResourceFormDialogProps {
  resolve: {
    proposal: Proposal;
    awardedResource?: AwardedResource;
  };
}

const WizardForms = [
  ResourceRequestWizardFormFirstPage,
  ResourceRequestWizardFormSecondPage,
  ResourceRequestWizardFormThirdPage,
];

const steps: ProgressStep[] = [
  { key: 'offering', label: translate('Select offering'), completed: false },
  { key: 'configure', label: translate('Configure award'), completed: false },
  {
    key: 'additional',
    label: translate('Additional configuration'),
    completed: false,
  },
];

/**
 * The call manager's editor for one item of the award.
 *
 * The same wizard the applicant requests with — offering, then plan and
 * amounts, then the offering's options — so an award is configured exactly as
 * a request is and the two can be read side by side. The purchase order stays
 * with the request.
 */
export const AwardedResourceFormDialog: FC<AwardedResourceFormDialogProps> = ({
  resolve: { proposal, awardedResource },
}) => {
  const { showErrorResponse, showSuccess } = useNotify();
  const { closeDialog } = useModal();
  const queryClient = useQueryClient();
  const isEdit = Boolean(awardedResource);

  const onSubmit = useCallback(
    async (formData) => {
      // An item left on the call offering's own plan stores none and follows
      // that plan until allocation; only a different plan is pinned.
      const callPlanUuid =
        formData.offering?.plan_details?.uuid ||
        getUUID(formData.offering?.plan);
      const chosenPlanUuid =
        typeof formData.plan === 'object'
          ? formData.plan?.uuid
          : getUUID(formData.plan);
      const body = {
        requested_offering_uuid: formData.offering.uuid,
        plan:
          chosenPlanUuid && chosenPlanUuid !== callPlanUuid
            ? chosenPlanUuid
            : null,
        limits: pickOfferingLimits(formData.limits, formData.offering),
        attributes: formData.attributes || {},
        description: formData.description || '',
      };
      try {
        if (awardedResource) {
          await proposalProposalsAwardedResourcesPartialUpdate({
            path: { uuid: proposal.uuid, obj_uuid: awardedResource.uuid },
            body,
          });
          showSuccess(translate('Awarded resource has been updated.'));
        } else {
          await proposalProposalsAwardedResourcesSet({
            path: { uuid: proposal.uuid },
            body,
          });
          showSuccess(translate('Awarded resource has been added.'));
        }
        closeDialog();
        await queryClient.invalidateQueries({
          queryKey: awardedResourcesKey(proposal.uuid),
        });
      } catch (error) {
        showErrorResponse(
          error,
          translate('Unable to save the awarded resource.'),
        );
      }
    },
    [
      proposal.uuid,
      awardedResource,
      showSuccess,
      showErrorResponse,
      closeDialog,
      queryClient,
    ],
  );

  // Built once: a fresh object on every render makes react-final-form
  // reinitialise and wipe what the manager has typed.
  const initialValues = useMemo(
    () =>
      awardedResource
        ? {
            offering: { ...awardedResource.requested_offering },
            attributes: awardedResource.attributes,
            limits: awardedResource.limits,
            // A plan uuid; the configure step resolves it against the
            // offering's plans.
            plan:
              awardedResource.plan ||
              awardedResource.requested_offering.plan_details,
            description: awardedResource.description,
          }
        : {},
    [awardedResource],
  );

  const [mainOffering, setMainOffering] = useState<any>(null);
  const handleFormChange = useCallback(
    (values) => {
      if (values?.mainOffering !== mainOffering) {
        setMainOffering(values?.mainOffering);
      }
    },
    [mainOffering],
  );

  const wizard = useMemo(
    () =>
      mainOffering?.options?.order?.length
        ? { steps, wizardForms: WizardForms }
        : { steps: steps.slice(0, 2), wizardForms: WizardForms.slice(0, 2) },
    [mainOffering],
  );

  return (
    <WizardFormContainer
      form="AwardedResourceForm"
      title={
        isEdit
          ? translate('Edit awarded resource')
          : translate('Add awarded resource')
      }
      submitLabel={isEdit ? translate('Save') : translate('Add')}
      onSubmit={onSubmit}
      steps={wizard.steps}
      wizardForms={wizard.wizardForms}
      initialValues={initialValues}
      modalProps={{ bodyClassName: 'min-h-550px pb-0' }}
      data={{
        call: { uuid: proposal.call_uuid, name: proposal.call_name },
        award: true,
      }}
      onChange={handleFormChange}
    />
  );
};
