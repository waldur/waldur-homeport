import { useRouter } from '@uirouter/react';
import arrayMutators from 'final-form-arrays';
import { useState } from 'react';
import { Form } from 'react-final-form';
import { remoteWaldurApiImportOffering } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';
import { WizardStepIndicator, useWizard } from '@/wizard';
import { useCustomer } from '@/workspace/hooks';

import { OFFERING_IMPORT_STEPS, OFFERING_IMPORT_TABS } from './tabs';
import { OfferingImportFormData } from './types';
import { WizardButtons } from './WizardButtons';
import { WizardTabs } from './WizardTabs';

export const RemoteOfferingImportDialog = ({ refetch }: { refetch?() }) => {
  const { step, setStep, goBack, goNext, isFirstStep, isLastStep } = useWizard(
    OFFERING_IMPORT_STEPS,
  );
  const { showErrorResponse, showSuccess } = useNotify();
  const { closeDialog } = useModal();
  const customer = useCustomer();
  const router = useRouter();

  const saveOffering = async (formData: OfferingImportFormData) => {
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
          uuid: formData.customer.uuid,
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

  const [credentials, setCredentials] = useState({ api_url: '', token: '' });

  return (
    <Form<OfferingImportFormData>
      onSubmit={saveOffering}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit, submitting, invalid, form, values }) => {
        const next = () => {
          if (
            values.api_url !== credentials.api_url ||
            values.token !== credentials.token
          ) {
            form.change('customer', null);
            form.change('offerings', null);
            setCredentials({ api_url: values.api_url, token: values.token });
          }
          goNext();
        };

        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={translate('Connect remote offerings')}
              subtitle={translate(
                'Connect offerings from remote organizations with configurable rules and mappings.',
              )}
              bodyClassName="h-400px"
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
              <WizardStepIndicator
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
      }}
    />
  );
};
