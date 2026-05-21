import { FC, useCallback } from 'react';
import {
  ServiceProvider,
  ProviderOffering,
  Checklist,
  marketplaceProviderOfferingsUpdateComplianceChecklist,
} from 'waldur-js-client';

import { ProgressStep } from '@/core/ProgressSteps';
import { WizardFormContainer } from '@/form/WizardFormContainer';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { ASSIGN_CHECKLIST_TO_OFFERINGS_FORM_ID } from '../constants';

import { Step1SelectChecklist } from './Step1SelectChecklist';
import { Step2SelectOfferings } from './Step2SelectOfferings';

const WizardForms = [Step1SelectChecklist, Step2SelectOfferings];

const steps: ProgressStep[] = [
  {
    key: 'checklist',
    label: translate('Select checklist'),
    completed: false,
  },
  {
    key: 'offerings',
    label: translate('Choose offerings'),
    completed: false,
  },
];

interface OwnProps {
  resolve: {
    provider: ServiceProvider;
    refetch;
  };
}

export const AssignOfferingChecklistFormDialog: FC<OwnProps> = (props) => {
  const { closeDialog } = useModal();

  const assignMutation = useManagedMutation<
    any,
    any,
    {
      formData: { checklist: Checklist; offerings: ProviderOffering[] };
    }
  >({
    mutationFn: async (args) => {
      const { formData } = args;
      if (!formData.checklist || !formData.offerings?.length) return;
      const promises = formData.offerings.map((offering) =>
        marketplaceProviderOfferingsUpdateComplianceChecklist({
          path: { uuid: offering.uuid },
          body: { compliance_checklist: formData.checklist.uuid },
        }),
      );
      await Promise.all(promises);
      closeDialog();
    },
    successMessage: translate(
      'The checklist was assigned to the selected offerings',
    ),
    errorMessage: translate('Unable to assign checklist.'),
    refetch: props.resolve.refetch,
  });

  const submitForm = useCallback(
    (formData) => assignMutation.mutateAsync({ formData }),
    [assignMutation],
  );

  return (
    <WizardFormContainer
      form={ASSIGN_CHECKLIST_TO_OFFERINGS_FORM_ID}
      onSubmit={submitForm}
      submitLabel={translate('Confirm')}
      steps={steps}
      wizardForms={WizardForms}
      title={translate('Assign checklist')}
      data={{ provider: props.resolve.provider }}
      modalProps={{ bodyClassName: 'h-500px' }}
    />
  );
};
