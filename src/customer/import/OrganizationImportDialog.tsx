import { FC, useCallback, useState } from 'react';
import { Customer, CustomerRequest, customersCreate } from 'waldur-js-client';

import { ProgressStep } from '@waldur/core/ProgressSteps';
import { WizardFormContainer } from '@waldur/form/WizardFormContainer';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { cleanObjectEmptyFields } from '@waldur/project/import/utils';
import {
  showError,
  showErrorResponse,
  showSuccess,
} from '@waldur/store/notify';

import { Step1DownloadTemplate } from './Step1DownloadTemplate';
import { Step2UploadFile } from './Step2UploadFile';
import { Step3PreviewAndImport } from './Step3PreviewAndImport';
import {
  getCustomerOptionalFields,
  deleteDuplicateRecords,
  parseOrganizationsFile,
  validateOrganizationCreation,
} from './utils';

interface OrganizationImportDialogProps {
  resolve: {
    refetch: () => void;
  };
}

const WizardForms = [
  Step1DownloadTemplate,
  Step2UploadFile,
  Step3PreviewAndImport,
];

const steps: ProgressStep[] = [
  {
    key: 'template',
    label: translate('Download template'),
    completed: false,
  },
  {
    key: 'upload',
    label: translate('Upload file'),
    completed: false,
  },
  {
    key: 'preview',
    label: translate('Preview & import'),
    completed: false,
  },
];

export const OrganizationImportDialog: FC<OrganizationImportDialogProps> = (
  props,
) => {
  // Save created organization (to avoid recreation) when we make modifications on the file after a failed submission
  const [createdOrgs, setCreatedOrgs] = useState<Customer[]>([]);

  const submitForm = useCallback(
    async (formData, dispatch, formProps) => {
      const organizations = await parseOrganizationsFile(formData.file[0]);
      const validRecords = organizations.filter((row) => {
        const validate = validateOrganizationCreation(row);
        return validate.valid;
      });
      const { rows } = deleteDuplicateRecords(validRecords, ['name', 'email']);

      try {
        const promises = [];

        rows.forEach((org) => {
          const orgAlreadySaved = createdOrgs.find(
            (exist) => exist.name === org.name && exist.email === org.email,
          );

          if (orgAlreadySaved) return;

          // Create the organization
          const payload = {
            name: org.name,
            email: org.email,
            ...getCustomerOptionalFields().reduce((acc, field) => {
              acc[field.key] = org[field.key];
              return acc;
            }, {}),
          } as CustomerRequest;
          // Delete empty fields
          cleanObjectEmptyFields(payload);

          promises.push(
            customersCreate({ body: payload }).then((res) => {
              setCreatedOrgs((prev) =>
                prev.concat({ name: res.data.name, email: res.data.email }),
              );
              return res;
            }),
          );
        });
        if (promises.length === 0 && createdOrgs.length === 0) {
          dispatch(showError(translate('No valid organizations to import')));
          return;
        }

        await Promise.allSettled(promises).then((results) => {
          const error = results.filter((res) => res.status === 'rejected');
          const success = results.filter((res) => res.status === 'fulfilled');

          if (success.length) {
            props.resolve.refetch();
            dispatch(
              showSuccess(
                translate('Successfully imported {n} organizations', {
                  n: success.length,
                }),
              ),
            );
          }
          if (error.length) {
            dispatch(showErrorResponse(error[0].reason));
          } else {
            formProps.destroy();
            dispatch(closeModalDialog());
          }
          return results;
        });
      } catch (err) {
        dispatch(showErrorResponse(err));
      }
    },
    [createdOrgs, setCreatedOrgs, props.resolve.refetch],
  );
  return (
    <WizardFormContainer
      form="BulkImportOrganizations"
      onSubmit={submitForm}
      steps={steps}
      title={translate('Bulk import of organizations')}
      wizardForms={WizardForms}
      submitLabel={translate('Import & create')}
      modalProps={{ bodyClassName: 'h-500px' }}
    />
  );
};
