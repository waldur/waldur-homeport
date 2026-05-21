import { FC, useCallback, useMemo, useState } from 'react';
import {
  CallResourceTemplateRequest,
  proposalProtectedCallsResourceTemplatesSet,
  proposalProtectedCallsResourceTemplatesUpdate,
  ProviderRequestedOffering,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { Offering, Plan } from '@/marketplace/types';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceRequestWizardFormSecondPage as Step2Plan } from '@/proposals/proposal/create/resource-requests-step/ResourceRequestWizardFormSecondPage';
import { ResourceRequestWizardFormThirdPage as Step3AdditionalConfig } from '@/proposals/proposal/create/resource-requests-step/ResourceRequestWizardFormThirdPage';
import { Call } from '@/proposals/types';
import { ProgressStep, WizardFormContainer } from '@/wizard';

import { Step1General } from './Step1General';
import { Step4FinalConfig } from './Step4FinalConfig';

interface ResourceTemplateFormDialogProps {
  resolve: { uuid?: string; refetch; call?: Call };
  initialValues?: ResourceTemplateFormData;
}

interface ResourceTemplateFormData {
  name: string;
  offering: Partial<ProviderRequestedOffering>;
  description?: string;
  plan?: Plan;
  attributes: any;
  limits: any;
}

const WizardForms = [
  Step1General,
  Step2Plan,
  Step3AdditionalConfig,
  Step4FinalConfig,
];

const steps: ProgressStep[] = [
  {
    key: 'general',
    label: translate('General information'),
    completed: false,
  },
  {
    key: 'plan',
    label: translate('Plan'),
    completed: false,
  },
  {
    key: 'additional',
    label: translate('Additional configuration'),
    completed: false,
  },
  {
    key: 'final',
    label: translate('Final configuration'),
    completed: false,
  },
];

export const ResourceTemplateFormDialog: FC<ResourceTemplateFormDialogProps> = (
  props,
) => {
  const isEdit = Boolean(props.resolve.uuid);
  const { closeDialog } = useModal();

  const submitFormMutation = useManagedMutation<
    any,
    any,
    {
      formData: ResourceTemplateFormData;
    }
  >({
    mutationFn: (args) => {
      const { formData } = args;
      const body: CallResourceTemplateRequest = {
        name: formData.name,
        requested_offering: formData.offering.url,
        description: formData.description,
        limits: formData.limits || {},
        attributes: formData.attributes || {},
      };
      if (isEdit) {
        return proposalProtectedCallsResourceTemplatesUpdate({
          path: {
            uuid: props.resolve.call.uuid,
            obj_uuid: props.resolve.uuid,
          },
          body,
        });
      } else {
        return proposalProtectedCallsResourceTemplatesSet({
          path: { uuid: props.resolve.call.uuid },
          body,
        });
      }
    },
    successMessage: isEdit
      ? translate('Resource template updated')
      : translate('Resource template added to the call successfully'),
    refetch: props.resolve.refetch,
    onSuccess: () => {
      closeDialog();
    },
  });

  const submitForm = useCallback(
    (formData) => submitFormMutation.mutateAsync({ formData }),
    [submitFormMutation],
  );

  const [mainOffering, setMainOffering] = useState<Offering>(null);

  const handleFormChange = useCallback(
    (values) => {
      if (values?.mainOffering !== mainOffering) {
        setMainOffering(values?.mainOffering);
      }
    },
    [mainOffering],
  );

  const WizardStepsData = useMemo(() => {
    return mainOffering?.options?.order?.length
      ? { steps, wizardForms: WizardForms }
      : {
          steps: [steps[0], steps[1], steps[3]],
          wizardForms: [WizardForms[0], WizardForms[1], WizardForms[3]],
        };
  }, [mainOffering]);

  return (
    <WizardFormContainer
      form="CallResourceTemplateForm"
      onSubmit={submitForm}
      submitLabel={translate('Confirm')}
      steps={WizardStepsData.steps}
      wizardForms={WizardStepsData.wizardForms}
      title={
        isEdit
          ? translate('Edit resource template')
          : translate('Create resource template')
      }
      initialValues={props.initialValues}
      data={{ call: props.resolve.call }}
      modalProps={{ bodyClassName: 'h-500px' }}
      onChange={handleFormChange}
    />
  );
};
