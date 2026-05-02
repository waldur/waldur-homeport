import { ArrowRightIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { useStore } from 'react-redux';
import { getFormValues } from 'redux-form';
import { adminArrowCustomerMappingsImportLicense } from 'waldur-js-client';

import { ProgressStep } from '@/core/ProgressSteps';
import { WizardFormContainer } from '@/form/WizardFormContainer';
import { formatJsxTemplate, translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';

import { Step1SelectCustomer } from './Step1SelectCustomer';
import { Step2SelectVendorOffering } from './Step2SelectVendorOffering';
import { Step3SelectProject } from './Step3SelectProject';
import { Step4SelectLicenses } from './Step4SelectLicenses';

const FORM_ID = 'ArrowImportWizard';

interface ArrowImportWizardProps {
  resolve: {
    refetch?: () => void;
  };
}

const WizardForms = [
  Step1SelectCustomer,
  Step2SelectVendorOffering,
  Step3SelectProject,
  Step4SelectLicenses,
];

const steps: ProgressStep[] = [
  {
    key: 'customer',
    label: translate('Customer'),
    completed: false,
  },
  {
    key: 'offering',
    label: translate('Offering'),
    completed: false,
  },
  {
    key: 'project',
    label: translate('Project'),
    completed: false,
  },
  {
    key: 'licenses',
    label: translate('Licenses'),
    completed: false,
  },
];

export const ArrowImportWizard: FC<ArrowImportWizardProps> = (props) => {
  const { showError, showSuccess } = useNotify();

  const { closeDialog } = useModal();

  const store = useStore();

  const submitForm = useCallback(
    async (_formData, _dispatch, formProps) => {
      const formValues = getFormValues(FORM_ID)(store.getState()) as {
        customerMapping?: {
          uuid: string;
          waldur_customer_name: string;
          waldur_customer_uuid: string;
        };
        vendorOffering?: {
          uuid: string;
          offering_uuid: string;
          offering_name: string;
          arrow_vendor_name: string;
        };
        project?: {
          uuid: string;
          name: string;
        };
        selectedLicenses?: Array<{
          license_reference: string;
          friendly_name: string;
          offer_name: string;
        }>;
      };

      const customerMapping = formValues?.customerMapping;
      const vendorOffering = formValues?.vendorOffering;
      const project = formValues?.project;
      const selectedLicenses = formValues?.selectedLicenses || [];

      if (!customerMapping || !vendorOffering || !project) {
        showError(translate('Please complete all steps'));
        return;
      }

      if (selectedLicenses.length === 0) {
        showError(translate('Please select at least one license to import'));
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const license of selectedLicenses) {
        try {
          await adminArrowCustomerMappingsImportLicense({
            path: { uuid: customerMapping.uuid },
            body: {
              license_reference: license.license_reference,
              license_name: license.friendly_name || license.offer_name,
              offering_uuid: vendorOffering.offering_uuid,
              project_uuid: project.uuid,
            },
          });
          successCount++;
        } catch {
          errorCount++;
        }
      }

      if (successCount > 0) {
        showSuccess(
          translate('Successfully imported {n} license(s)', {
            n: successCount,
          }),
        );
      }

      if (errorCount > 0) {
        showError(
          translate('Failed to import {n} license(s)', {
            n: errorCount,
          }),
        );
      }

      if (successCount > 0) {
        props.resolve?.refetch?.();
        formProps.destroy();
        closeDialog();
      }
    },
    [store],
  );

  return (
    <WizardFormContainer
      form={FORM_ID}
      onSubmit={submitForm}
      steps={steps}
      hideStepper={false}
      title={translate('Import Arrow licenses')}
      subtitle={translate(
        'Customer {arrow} Offering {arrow} Project {arrow} Select licenses',
        { arrow: <ArrowRightIcon weight="bold" /> },
        formatJsxTemplate,
      )}
      wizardForms={WizardForms}
      submitLabel={translate('Import')}
      initialValues={{
        selectedLicenses: [],
      }}
      modalProps={{ bodyClassName: 'min-h-400px' }}
    />
  );
};
