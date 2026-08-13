import { FC, useCallback, useMemo, useState } from 'react';
import {
  proposalProposalsResourcePurchaseOrderSet,
  proposalProposalsResourcesPartialUpdate,
  proposalProposalsResourcesSet,
  ProviderOfferingDetails as Offering,
} from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { getPurchaseOrderRequirement } from '@/proposals/purchaseOrderRequirement';
import {
  Proposal,
  ProposalResource,
  ProposalResourceFormData,
} from '@/proposals/types';
import { useNotify } from '@/store/notify';
import { ProgressStep, WizardFormContainer } from '@/wizard';

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
  const { showErrorResponse, showSuccess } = useNotify();
  const { closeDialog } = useModal();

  const callback = useCallback(
    async (formData: ProposalResourceFormData) => {
      const attributes = {};
      if (formData.attributes) {
        Object.assign(attributes, formData.attributes);
      }
      // Limits belong in the model's own `limits` field. They used to be
      // written into `attributes.limits`, which round-tripped through this
      // dialog but left RequestedResource.limits empty — so the requested
      // amount never reached allocate_proposal, and approved proposals
      // provisioned resources with no quota at all.
      const payload = {
        requested_offering_uuid: formData.offering.uuid,
        attributes,
        limits: formData.limits || {},
        purchase_order_reference: formData.purchase_order_reference || '',
      };
      // The document travels separately: a file cannot ride along with the
      // JSON body, so it goes to the multipart action once the row exists —
      // the same split the marketplace order attachment uses.
      const uploadAttachment = async (obj_uuid: string) => {
        if (!(formData.attachment instanceof File)) {
          return;
        }
        await proposalProposalsResourcePurchaseOrderSet({
          path: { uuid: props.resolve.proposal.uuid, obj_uuid },
          body: { attachment: fileSerializer(formData.attachment) } as any,
          ...formDataOptions,
        });
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
          await uploadAttachment(props.resolve.resourceRequest.uuid);
          showSuccess(translate('Resource request has been updated.'));
          closeDialog();
          props.resolve.refetch();
        } catch (error) {
          showErrorResponse(error, translate('Something went wrong'));
        }
      } else {
        // Create new
        try {
          const response = await proposalProposalsResourcesSet({
            path: { uuid: props.resolve.proposal.uuid },
            body: payload,
          });
          await uploadAttachment((response.data as any)?.uuid);
          showSuccess(translate('Resource request has been submitted.'));
          closeDialog();
          props.resolve.refetch();
        } catch (error) {
          showErrorResponse(error, translate('Something went wrong'));
        }
      }
    },
    [props.resolve, showSuccess, showErrorResponse, closeDialog],
  );

  const isEdit = Boolean(props.resolve.resourceRequest);

  // Built once. Inline, this object — and the fresh `offering` copy inside it —
  // got a new identity on every render, so react-final-form saw new
  // initialValues and reinitialised the form. Since a value change re-renders
  // this dialog through the FormSpy below, every keystroke was wiped: the
  // purchase order reference refused to accept input and a chosen file
  // disappeared the moment it was picked.
  const initialValues = useMemo(
    () =>
      props.resolve.resourceRequest
        ? {
            offering: { ...props.resolve.resourceRequest.requested_offering },
            attributes: props.resolve.resourceRequest.attributes,
            // Fall back to the legacy location for requests written before
            // limits moved to their own field.
            limits:
              props.resolve.resourceRequest.limits ||
              props.resolve.resourceRequest.attributes?.limits,
            plan: props.resolve.resourceRequest.requested_offering.plan_details,
            purchase_order_reference:
              props.resolve.resourceRequest.purchase_order_reference || '',
            // The stored document is a URL, not a File; leaving the picker
            // empty means "keep what is there" rather than re-uploading it.
            attachment: null,
          }
        : {},
    [props.resolve.resourceRequest],
  );

  const [mainOffering, setMainOffering] = useState<Offering>(null);
  const [requestedOffering, setRequestedOffering] = useState(null);

  const handleFormChange = useCallback(
    (values) => {
      if (values?.mainOffering !== mainOffering) {
        setMainOffering(values?.mainOffering);
      }
      if (values?.offering !== requestedOffering) {
        setRequestedOffering(values?.offering);
      }
    },
    [mainOffering, requestedOffering],
  );

  const WizardStepsData = useMemo(() => {
    // The last step carries the purchase order as well as the offering
    // options, so it has to survive for an offering that needs one but
    // declares no options — otherwise the field the call demands is
    // unreachable and the proposal can never be submitted.
    const { showPurchaseOrder } = getPurchaseOrderRequirement(
      requestedOffering,
      mainOffering,
    );
    return mainOffering?.options?.order?.length || showPurchaseOrder
      ? { steps, wizardForms: WizardForms }
      : {
          steps: steps.slice(0, 2),
          wizardForms: WizardForms.slice(0, 2),
        };
  }, [mainOffering, requestedOffering]);

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
      initialValues={initialValues}
      data={{
        call: {
          uuid: props.resolve.proposal.call_uuid,
          name: props.resolve.proposal.call_name,
        },
        // The picker cannot hold the stored document — it is a URL, not a File
        // — so hand it to the purchase order block separately, or an editor
        // sees an empty field where their attachment should be.
        existingAttachment: props.resolve.resourceRequest?.attachment,
      }}
      onChange={handleFormChange}
    />
  );
};
