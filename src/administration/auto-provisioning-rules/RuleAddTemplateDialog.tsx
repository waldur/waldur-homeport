import { FC, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { autoprovisioningRulesPartialUpdate, Rule } from 'waldur-js-client';

import { ProgressStep } from '@/core/ProgressSteps';
import { AtLeast } from '@/core/types';
import { WizardFormContainer } from '@/form/WizardFormContainer';
import { translate } from '@/i18n';
import { Category, Offering, Plan } from '@/marketplace/types';
import { closeModalDialog } from '@/modal/actions';
import { ResourceRequestWizardFormThirdPage as Step2AdditionalConfig } from '@/proposals/proposal/create/resource-requests-step/ResourceRequestWizardFormThirdPage';
import { showErrorResponse, showSuccess } from '@/store/notify';

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
  const submitForm = useCallback(
    async (formData, dispatch, formProps) => {
      try {
        await autoprovisioningRulesPartialUpdate({
          path: { uuid: props.resolve.rule.uuid },
          body: {
            plan_attributes: formData.attributes,
            plan_limits: formData.limits || {},
            plan: formData.plan.url,
            project_role_name: props.resolve.rule.project_role_display_name,
          },
        });
        if (props.resolve.rule.plan) {
          // Edit current
          dispatch(showSuccess(translate('Template edited successfully')));
        } else {
          // Add new
          dispatch(
            showSuccess(translate('Template added to the rule successfully')),
          );
        }

        formProps.destroy();
        if (props.resolve.refetch) await props.resolve.refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(showErrorResponse(error));
      }
    },
    [props.resolve.refetch],
  );

  /** Auto filling `offering` in step 1 */
  const mainOffering: Offering = useSelector((state) =>
    formValueSelector('RuleAddTemplateForm')(state, 'offering'),
  );

  const WizardStepsData = useMemo(() => {
    return mainOffering?.options?.order?.length
      ? { steps, wizardForms: WizardForms }
      : {
          steps: [steps[0], steps[2]],
          wizardForms: [WizardForms[0], WizardForms[2]],
        };
  }, [mainOffering]);

  return (
    <WizardFormContainer
      form="RuleAddTemplateForm"
      onSubmit={submitForm}
      submitLabel={translate('Confirm')}
      steps={WizardStepsData.steps}
      wizardForms={WizardStepsData.wizardForms}
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
