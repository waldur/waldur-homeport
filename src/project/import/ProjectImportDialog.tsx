import { FC, useCallback, useState } from 'react';
import {
  Customer,
  marketplaceOrdersCreate,
  Offering,
  Project,
  projectsCreate,
} from 'waldur-js-client';

import { formatISODate } from '@waldur/core/dateUtils';
import { ProgressStep } from '@waldur/core/ProgressSteps';
import { getCustomer } from '@waldur/customer/utils';
import { WizardFormContainer } from '@waldur/form/WizardFormContainer';
import { translate } from '@waldur/i18n';
import { formatOrderForCreate } from '@waldur/marketplace/details/utils';
import { closeModalDialog } from '@waldur/modal/actions';
import {
  showError,
  showErrorResponse,
  showSuccess,
} from '@waldur/store/notify';

import { Step1ImportType } from './Step1ImportType';
import { Step2SelectOffering } from './Step2SelectOffering';
import { Step3DownloadTemplate } from './Step3DownloadTemplate';
import { Step4UploadFile } from './Step4UploadFile';
import { Step5PreviewAndImport } from './Step5PreviewAndImport';
import { cleanObjectEmptyFields, parseProjectsAndResourcesFile } from './utils';

import './ProjectImportDialog.scss';

interface ProjectImportDialogProps {
  resolve: {
    customer: Customer;
    refetch: () => void;
  };
}

const WizardForms = [
  Step1ImportType,
  Step2SelectOffering,
  Step3DownloadTemplate,
  Step4UploadFile,
  Step5PreviewAndImport,
];

const steps: ProgressStep[] = [
  {
    key: 'type',
    label: translate('Import type'),
    completed: false,
  },
  {
    key: 'offering',
    label: translate('Select offering'),
    completed: false,
  },
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

export const ProjectImportDialog: FC<ProjectImportDialogProps> = (props) => {
  // On submitForm, sometimes some projects are created, but we get errors during the operation.
  // We remember the created projects so that we don't have to recreate them when we make a modification.
  const [createdProjects, setCreatedProjects] = useState<Project[]>([]);

  const submitForm = useCallback(
    async (formData, dispatch, formProps) => {
      const _customer = props.resolve.customer;
      const projects = await parseProjectsAndResourcesFile(formData.file[0]);
      const offering = formData.offering as Offering;
      const hasResources = formData.import_type === 'projects_with_resources';

      if (!_customer && projects.some((proj) => !proj.customer_uuid)) {
        dispatch(
          showError(
            translate(
              'The organization UUID is not specified in one or more records.',
            ),
          ),
        );
        return;
      }

      try {
        // Fetch all the customers that were imported
        let customers: Customer[];
        if (_customer) {
          customers = [_customer];
        } else {
          const uuids = projects.map((project) => project.customer_uuid);
          customers = await Promise.all(
            uuids.map((uuid) => getCustomer(uuid, ['uuid', 'url'])),
          );
        }

        // Import projects first
        const promises = [];
        const resourcesPayload = [];

        const addRequestPayloadForResources = (
          project,
          customer,
          resources,
        ) => {
          if (!hasResources || !resources) return;
          // Prepare request payloads for resources creation.
          resources.forEach((resource) => {
            const planName = String(resource.plan_name || '')
              .toLowerCase()
              .trim();
            const payload = formatOrderForCreate({
              offering,
              formData: {
                ...resource,
                project,
                customer,
                offering,
                plan: offering.plans
                  ? offering.plans.find(
                      (plan) => plan.name.toLowerCase().trim() === planName,
                    )
                  : null,
              },
            });
            resourcesPayload.push(payload);
          });
        };

        let projectsCounter = 0;

        projects.forEach(({ resources, ...project }) => {
          if (!project.name) return;
          const start_date = project.start_date
            ? formatISODate(project.start_date)
            : undefined;
          const end_date = project.end_date
            ? formatISODate(project.end_date)
            : undefined;

          projectsCounter++;
          const existingProject = createdProjects.find(
            (exist) =>
              exist.name === project.name &&
              (_customer || exist.customer_uuid === project.customer_uuid),
          );

          const customer = project.customer_uuid
            ? customers.find((c) => c.uuid === project.customer_uuid)
            : _customer;

          if (existingProject) {
            // No need to recreate project, just add resources
            addRequestPayloadForResources(existingProject, customer, resources);
          } else {
            // Create the project
            const projectPayload = {
              ...project,
              name: project.name,
              type: project.project_type,
              end_date,
              start_date,
              customer: customer.url,
            };
            // Delete empty fields
            cleanObjectEmptyFields(projectPayload);

            promises.push(
              projectsCreate({ body: projectPayload }).then((res) => {
                setCreatedProjects((prev) => prev.concat(res.data));
                if (!hasResources || !resources) return res;
                // Prepare request payloads for resources creation.
                addRequestPayloadForResources(res.data, customer, resources);
                return res;
              }),
            );
          }
        });
        if (promises.length === 0 && createdProjects.length === 0) {
          dispatch(showError(translate('No valid projects to import')));
          return;
        }
        await Promise.all(promises);

        // Import resources
        if (resourcesPayload.length > 0) {
          await Promise.all(
            resourcesPayload.map((payload) =>
              marketplaceOrdersCreate({ body: payload }),
            ),
          );
        }

        formProps.destroy();
        dispatch(closeModalDialog());
        props.resolve.refetch();
        dispatch(
          showSuccess(
            formData.import_type === 'projects_only' ||
              resourcesPayload.length === 0
              ? translate('Successfully imported {n} projects', {
                  n: projectsCounter,
                })
              : translate(
                  'Successfully imported {n} projects and {m} resources',
                  { n: projectsCounter, m: resourcesPayload.length },
                ),
          ),
        );
      } catch (err) {
        dispatch(showErrorResponse(err));
      }
    },
    [
      props.resolve.customer,
      props.resolve.refetch,
      createdProjects,
      setCreatedProjects,
    ],
  );
  return (
    <WizardFormContainer
      form="BulkImportProjects"
      onSubmit={submitForm}
      steps={steps}
      title={translate('Bulk import of projects')}
      wizardForms={WizardForms}
      submitLabel={translate('Import & create')}
      data={{ customer: props.resolve.customer }}
      initialValues={{
        import_type: 'projects_only',
        customer_uuid: props.resolve.customer?.uuid,
      }}
      modalProps={{ bodyClassName: 'h-500px' }}
    />
  );
};
