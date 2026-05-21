import { FC, useCallback, useMemo, useState } from 'react';
import { Form } from 'react-final-form';
import {
  Customer,
  marketplaceOrdersCreate,
  Project,
  projectsCreate,
} from 'waldur-js-client';

import { formatISODate } from '@/core/dateUtils';
import { getCustomer } from '@/customer/utils';
import { translate } from '@/i18n';
import { formatOrderForCreate } from '@/marketplace/details/utils';
import { WizardButtons } from '@/marketplace/offerings/import/WizardButtons';
import { WizardTabs } from '@/marketplace/offerings/import/WizardTabs';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';
import { ProgressStep, WizardStepIndicator, useWizard } from '@/wizard';

import { Step1ImportType } from './Step1ImportType';
import { Step2SelectOffering } from './Step2SelectOffering';
import { Step3DownloadTemplate } from './Step3DownloadTemplate';
import { Step4UploadFile } from './Step4UploadFile';
import { Step5PreviewAndImport } from './Step5PreviewAndImport';
import { ProjectImportFormData } from './types';
import { cleanObjectEmptyFields, parseProjectsAndResourcesFile } from './utils';

import './ProjectImportDialog.scss';
import '@/wizard/wizard.scss';

interface ProjectImportDialogProps {
  resolve: {
    customer: Customer;
    refetch: () => void;
  };
}

const TABS = {
  type: Step1ImportType,
  offering: Step2SelectOffering,
  template: Step3DownloadTemplate,
  upload: Step4UploadFile,
  preview: Step5PreviewAndImport,
};

const initialSteps: ProgressStep[] = [
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
  const { showSuccess } = useNotify();
  const [createdProjects, setCreatedProjects] = useState<Project[]>([]);
  const [skipErrors, setSkipErrors] = useState(false);
  const [stepValidations, setStepValidations] = useState<
    Record<string, { valid: boolean; tooltip: string | null }>
  >({});

  const setStepValidation = useCallback(
    (stepKey: string, valid: boolean, tooltip: string | null) => {
      setStepValidations((prev) => {
        if (
          prev[stepKey]?.valid === valid &&
          prev[stepKey]?.tooltip === tooltip
        ) {
          return prev;
        }
        return { ...prev, [stepKey]: { valid, tooltip } };
      });
    },
    [],
  );

  const importMutation = useManagedMutation<any, any, ProjectImportFormData>({
    mutationFn: async (formData) => {
      const _customer = props.resolve.customer;
      if (!formData.file?.length) {
        throw new Error(translate('Please upload a file.'));
      }
      const projects = await parseProjectsAndResourcesFile(formData.file[0]);
      const offering = formData.offering;
      const hasResources = formData.import_type === 'projects_with_resources';

      if (!_customer && projects.some((proj) => !proj.customer_uuid)) {
        throw new Error(
          translate(
            'The organization UUID is not specified in one or more records.',
          ),
        );
      }

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

      const addRequestPayloadForResources = (project, customer, resources) => {
        if (!hasResources || !resources || !offering) return;
        // Prepare request payloads for resources creation.
        resources.forEach((resource) => {
          const planName = String(resource.plan_name || '')
            .toLowerCase()
            .trim();
          const payload = formatOrderForCreate(offering, {
            ...resource,
            project,
            customer,
            offering,
            plan: offering.plans
              ? offering.plans.find(
                  (plan) => plan.name.toLowerCase().trim() === planName,
                )
              : null,
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
        throw new Error(translate('No valid projects to import'));
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

      return {
        projectsCounter,
        resourcesCount: resourcesPayload.length,
        import_type: formData.import_type,
      };
    },
    onSuccess: (res) => {
      if (!res) return;
      showSuccess(
        res.import_type === 'projects_only' || res.resourcesCount === 0
          ? translate('Successfully imported {n} projects', {
              n: res.projectsCounter,
            })
          : translate('Successfully imported {n} projects and {m} resources', {
              n: res.projectsCounter,
              m: res.resourcesCount,
            }),
      );
    },
    errorMessage: translate('Unable to import projects'),
    refetch: props.resolve.refetch,
  });

  const { step: activeStep, setStep: setActiveStep } = useWizard(initialSteps);

  return (
    <Form<ProjectImportFormData>
      onSubmit={(values) => importMutation.mutateAsync(values)}
      initialValues={{
        import_type: 'projects_only',
        customer_uuid: props.resolve.customer?.uuid,
      }}
    >
      {({ handleSubmit, submitting, values, errors }) => {
        const isProjectsOnly = values?.import_type === 'projects_only';
        const currentSteps = useMemo(() => {
          return initialSteps.filter((s) =>
            isProjectsOnly ? s.key !== 'offering' : true,
          );
        }, [isProjectsOnly]);

        let effectiveStep = activeStep;
        if (!currentSteps.some((s) => s.key === effectiveStep.key)) {
          effectiveStep = currentSteps[0];
        }

        const currentStepValidation = stepValidations[effectiveStep.key] ?? {
          valid: true,
          tooltip: null,
        };

        let isStepInvalid = false;
        if (effectiveStep.key === 'type') {
          isStepInvalid = Boolean(errors?.import_type);
        } else if (effectiveStep.key === 'upload') {
          isStepInvalid = Boolean(errors?.file);
        }

        const isFirstStep = effectiveStep.key === currentSteps[0].key;
        const isLastStep =
          effectiveStep.key === currentSteps[currentSteps.length - 1].key;

        return (
          <form onSubmit={handleSubmit} data-testid="project-import-dialog">
            <ModalDialog
              title={translate('Bulk import of projects')}
              bodyClassName="h-500px wizard"
              footer={
                <WizardButtons
                  isFirstStep={isFirstStep}
                  isLastStep={isLastStep}
                  goBack={() => {
                    const idx = currentSteps.findIndex(
                      (s) => s.key === effectiveStep.key,
                    );
                    if (idx > 0) setActiveStep(currentSteps[idx - 1]);
                  }}
                  goNext={() => {
                    const idx = currentSteps.findIndex(
                      (s) => s.key === effectiveStep.key,
                    );
                    if (idx < currentSteps.length - 1)
                      setActiveStep(currentSteps[idx + 1]);
                  }}
                  submitting={submitting}
                  invalid={isStepInvalid || !currentStepValidation.valid}
                  submitLabel={translate('Import & create')}
                  tooltip={currentStepValidation.tooltip || undefined}
                />
              }
            >
              <WizardStepIndicator
                steps={currentSteps}
                value={effectiveStep}
                onClick={(_, i) =>
                  !isStepInvalid && setActiveStep(currentSteps[i])
                }
                disabled={submitting}
              />
              <div className="wizard-big  wizard-body clearfix">
                <div className="content clearfix">
                  <WizardTabs
                    steps={currentSteps}
                    currentStep={effectiveStep}
                    tabs={TABS}
                    mountOnEnter={true}
                    context={{
                      customer: props.resolve.customer,
                      skipErrors,
                      setSkipErrors,
                      setStepValidation,
                    }}
                  />
                </div>
              </div>
            </ModalDialog>
          </form>
        );
      }}
    </Form>
  );
};
