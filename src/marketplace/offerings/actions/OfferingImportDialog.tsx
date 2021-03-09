import { triggerTransition } from '@uirouter/redux';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { StepsList } from '@waldur/marketplace/common/StepsList';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCustomer } from '@waldur/workspace/selectors';

import { WizardButtons } from '../create/WizardButtons';
import { WizardTabs } from '../create/WizardTabs';

import { importOffering } from './api';
import { OFFERING_IMPORT_FORM_ID } from './constants';
import { OFFERING_IMPORT_STEPS, OFFERING_IMPORT_TABS } from './tabs';
import { OfferingImportFormData } from './types';
import { useWizard } from './useWizard';

export const OfferingImportDialog = reduxForm<OfferingImportFormData, any>({
  form: OFFERING_IMPORT_FORM_ID,
})(({ handleSubmit, submitting, invalid }) => {
  const { step, setStep, goBack, goNext, isLastStep } = useWizard(
    OFFERING_IMPORT_STEPS,
  );
  const customer = useSelector(getCustomer);
  const dispatch = useDispatch();
  const saveOffering = async (formData: OfferingImportFormData) => {
    try {
      const response = await importOffering({
        api_url: formData.api_url,
        token: formData.token,
        remote_offering_uuid: formData.offering.uuid,
        remote_customer_uuid: formData.customer.uuid,
        local_category_uuid: formData.category.uuid,
        local_customer_uuid: customer.uuid,
      });
      dispatch(
        triggerTransition('marketplace-offering-update', {
          offering_uuid: response.data.uuid,
        }),
      );
      dispatch(showSuccess(translate('Offering has been imported.')));
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to import remote offering.')),
      );
    }
  };
  return (
    <form onSubmit={handleSubmit(saveOffering)}>
      <ModalDialog title={translate('Import offering')}>
        <StepsList
          choices={OFFERING_IMPORT_STEPS}
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
        <WizardButtons
          isLastStep={isLastStep}
          goBack={goBack}
          goNext={goNext}
          submitting={submitting}
          invalid={invalid}
        />
      </ModalDialog>
    </form>
  );
});
