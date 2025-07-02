import { useRouter } from '@uirouter/react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';
import { remoteWaldurApiImportOffering } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { StepsList } from '@waldur/marketplace/common/StepsList';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';
import { getCustomer } from '@waldur/workspace/selectors';

import { OFFERING_IMPORT_FORM_ID } from './constants';
import { importOfferingSelector } from './selectors';
import { OFFERING_IMPORT_STEPS, OFFERING_IMPORT_TABS } from './tabs';
import { OfferingImportFormData } from './types';
import { useWizard } from './useWizard';
import { WizardButtons } from './WizardButtons';
import { WizardTabs } from './WizardTabs';

export const OfferingImportDialog = reduxForm<
  OfferingImportFormData,
  { refetch? }
>({
  form: OFFERING_IMPORT_FORM_ID,
})(({ handleSubmit, submitting, invalid, change, refetch }) => {
  const { step, setStep, goBack, goNext, isFirstStep, isLastStep } = useWizard(
    OFFERING_IMPORT_STEPS,
  );
  const { showErrorResponse, showSuccess } = useNotify();
  const { closeDialog } = useModal();
  const customer = useSelector(getCustomer);
  const router = useRouter();

  const saveOffering = async (
    formData: OfferingImportFormData,
    _,
    formProps,
  ) => {
    if (formProps.invalid) return;
    try {
      const promises = formData.offerings.map((offering) => {
        const categoryMap = formData.categories_set.find(
          (map) => map.remote_category === offering.category_title,
        );
        return remoteWaldurApiImportOffering({
          body: {
            api_url: formData.api_url,
            token: formData.token,
            remote_offering_uuid: offering.uuid,
            remote_customer_uuid: formData.customer.uuid,
            local_category_uuid: categoryMap.local_category.uuid,
            local_customer_uuid: customer.uuid,
          },
        });
      });
      const response = await Promise.all(promises);
      if (response.length === 1) {
        router.stateService.go('marketplace-offering-update', {
          offering_uuid: response[0].data.uuid,
        });
      } else if (refetch) {
        refetch();
      }
      showSuccess(translate('Offerings has been imported.'));
      closeDialog();
    } catch (e) {
      showErrorResponse(e, translate('Unable to import remote offerings.'));
    }
  };

  // Clear all fields if API URL or Token change
  const [credentials, setCredentials] = useState({ api_url: '', token: '' });
  const formData = useSelector(importOfferingSelector);
  const next = () => {
    if (
      formData.api_url !== credentials.api_url ||
      formData.token !== credentials.token
    ) {
      change('customer', null);
      change('offerings', null);
      setCredentials({ api_url: formData.api_url, token: formData.token });
    }
    goNext();
  };

  return (
    <form onSubmit={handleSubmit(saveOffering)}>
      <ModalDialog
        title={translate('Mass import of remote offerings')}
        subtitle={translate(
          'Import offerings from remote organizations with configurable rules and mappings.',
        )}
        headerClassName="border-0 pb-0"
        bodyClassName="overflow-hidden border-0 min-h-400px"
        footer={
          <WizardButtons
            isLastStep={isLastStep}
            isFirstStep={isFirstStep}
            goBack={goBack}
            goNext={next}
            submitting={submitting}
            invalid={invalid}
          />
        }
      >
        <StepsList
          steps={OFFERING_IMPORT_STEPS}
          value={step}
          onClick={setStep}
          disabled={submitting}
        />

        <WizardTabs
          steps={OFFERING_IMPORT_STEPS}
          currentStep={step}
          tabs={OFFERING_IMPORT_TABS}
          mountOnEnter={true}
        />
      </ModalDialog>
    </form>
  );
});
