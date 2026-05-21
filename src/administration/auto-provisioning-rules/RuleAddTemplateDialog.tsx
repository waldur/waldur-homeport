import { FC, useCallback, useState } from 'react';
import { autoprovisioningRulesPartialUpdate, Rule } from 'waldur-js-client';

import { ProgressStep } from '@/core/ProgressSteps';
import { AtLeast } from '@/core/types';
import { WizardFormContainer } from '@/form/WizardFormContainer';
import { translate } from '@/i18n';
import { Category, Offering, Plan } from '@/marketplace/types';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceRequestWizardFormThirdPage as Step2AdditionalConfig } from '@/proposals/proposal/create/resource-requests-step/ResourceRequestWizardFormThirdPage';

import { Step1OfferingAndPlan } from './Step1OfferingAndPlan';
import { Step3FinalConfig } from './Step3FinalConfig';

interface RuleAddTemplateDialogProps {
  resolve: { refetch; rule?: Rule };
  initialValues?: {
    category: AtLeast<Category, 'url' | 'title'>;
    offering: AtLeast<Offering, 'uuid' | 'name'>;
    plan: AtLeast<Plan, 'url' | 'name'>;
    attributes: Record<string, any>;
    limits: Record<string, any>;
  };
}

const WizardForms = [
  Step1OfferingAndPlan,
  Step2AdditionalConfig,
  Step3FinalConfig,
];

const steps: ProgressStep[] = [
  {
    key: 'offering',
    label: translate('Offering and plan'),
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

export const RuleAddTemplateDialog: FC<RuleAddTemplateDialogProps> = (
  props,
) => {
  const { closeDialog } = useModal();
  const [wizardSteps, setWizardSteps] = useState(() => {
    const mainOffering = props.initialValues?.offering;
    return mainOffering?.options?.order?.length
      ? { steps, wizardForms: WizardForms }
      : {
          steps: [steps[0], steps[2]],
          wizardForms: [WizardForms[0], WizardForms[2]],
        };
  });

  const submitMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      autoprovisioningRulesPartialUpdate({
        path: { uuid: props.resolve.rule.uuid },
        body: {
          plan_attributes: formData.attributes,
          plan_limits: formData.limits || {},
          plan: formData.plan.url,
          project_role_name: props.resolve.rule.project_role_display_name,
        },
      }),
    successMessage: props.resolve.rule.plan
      ? translate('Template edited successfully')
      : translate('Template added to the rule successfully'),
    refetch: props.resolve.refetch,
  });

  const submitForm = useCallback(
    async (formData) => {
      await submitMutation.mutateAsync(formData);
      closeDialog();
    },
    [submitMutation, closeDialog],
  );

  const handleFormChange = useCallback((values) => {
    const mainOffering = values?.offering;
    if (mainOffering?.options?.order?.length) {
      setWizardSteps({ steps, wizardForms: WizardForms });
    } else {
      setWizardSteps({
        steps: [steps[0], steps[2]],
        wizardForms: [WizardForms[0], WizardForms[2]],
      });
    }
  }, []);

  return (
    <WizardFormContainer
      onSubmit={submitForm}
      submitLabel={translate('Confirm')}
      steps={wizardSteps.steps}
      wizardForms={wizardSteps.wizardForms}
      onChange={handleFormChange}
      title={
        props.resolve.rule.plan
          ? translate('Edit template')
          : translate('Add template')
      }
      initialValues={props.initialValues}
      data={{ rule: props.resolve.rule }}
      modalProps={{ bodyClassName: 'h-500px' }}
    />
  );
};
