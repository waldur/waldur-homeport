import { FC, useCallback } from 'react';
import {
  ServiceProvider,
  ProviderOffering,
  Checklist,
  marketplaceProviderOfferingsUpdateComplianceChecklist,
} from 'waldur-js-client';

import { ProgressStep } from '@waldur/core/ProgressSteps';
import { WizardFormContainer } from '@waldur/form/WizardFormContainer';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

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
  const submitForm = useCallback(
    async (
      formData: { checklist: Checklist; offerings: ProviderOffering[] },
      dispatch,
      formProps,
    ) => {
      if (!formData.checklist || !formData.offerings?.length) return;
      try {
        const promises = formData.offerings.map((offering) =>
          marketplaceProviderOfferingsUpdateComplianceChecklist({
            path: { uuid: offering.uuid },
            body: { compliance_checklist: formData.checklist.uuid },
          }),
        );
        await Promise.all(promises);

        dispatch(
          showSuccess(
            translate('The checklist was assigned to the selected offerings'),
          ),
        );
        formProps.destroy();
        if (props.resolve.refetch) await props.resolve.refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(showErrorResponse(error));
      }
    },
    [props.resolve.refetch],
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
