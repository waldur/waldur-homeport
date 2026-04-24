import { PlusCircleIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { useMemo, useState } from 'react';
import {
  AnswerSubmitRequest,
  KindEnum,
  Project,
  projectCreditsCreate,
  projectsCreate,
  projectsSubmitAnswers,
  QuestionAdmin,
} from 'waldur-js-client';

import { formDataOptions, fileSerializer } from '@waldur/core/api';
import { formatISODate } from '@waldur/core/dateUtils';
import { ProgressStep } from '@waldur/core/ProgressSteps';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { useNotify } from '@waldur/store/hooks';
import { Wizard } from '@waldur/wizard';
import { Customer } from '@waldur/workspace/types';

import { Step1ProjectInfo } from './Step1ProjectInfo';
import { Step2Metadata } from './Step2Metadata';

interface ProjectCreateDialogProps {
  customer?: Customer;
  refetch?: () => void;
}

interface ProjectFormData {
  name: string;
  slug?: string;
  description: string;
  end_date?: Date;
  start_date?: Date;
  customer: { url: string };
  type?: { url: string };
  oecd_fos_2007_code?: { value: string };
  science_sub_domain?: { uuid: string };
  is_industry: boolean;
  image?: File | Blob;
  project_credit?: string;
  kind?: KindEnum;
  // Metadata section
  metadata?: Record<string, any>;
  questions?: QuestionAdmin[];
}

const WizardForms = [Step1ProjectInfo, Step2Metadata];

const steps: ProgressStep[] = [
  {
    key: 'general',
    label: translate('Project info'),
    completed: false,
  },
  {
    key: 'metadata',
    label: translate('Metadata'),
    completed: false,
  },
];

export const ProjectCreateDialog = ({
  customer,
  refetch,
}: ProjectCreateDialogProps) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();
  const router = useRouter();

  // Store the project if it saved, to avoid resubmitting it if there is any other errors
  const [savedProject, setSavedProject] = useState<Project>(null);

  const onSubmit = async (formData: ProjectFormData) => {
    try {
      let response: { data: Project; error: any } = savedProject
        ? { data: savedProject, error: undefined }
        : null;
      if (!savedProject) {
        response = await projectsCreate({
          body: {
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            end_date: formData.end_date
              ? formatISODate(formData.end_date)
              : undefined,
            start_date: formData.start_date
              ? formatISODate(formData.start_date)
              : undefined,
            customer: formData.customer.url,
            type: formData.type?.url,
            oecd_fos_2007_code: formData.oecd_fos_2007_code?.value,
            science_sub_domain: formData.science_sub_domain?.uuid,
            is_industry: formData.is_industry,
            kind: formData.kind,
            image: fileSerializer(formData.image),
          },
          ...formDataOptions,
        });
        showSuccess(translate('Project has been created.'));

        setSavedProject(response.data);
      }
      let error;
      // Project credit
      if (!response.error && formData.project_credit) {
        try {
          await projectCreditsCreate({
            body: {
              project: response.data.url,
              value: formData.project_credit,
            },
          });
        } catch (err) {
          error = err;
          showErrorResponse(
            err,
            translate('Error while assigning credit to the project.'),
          );
        }
      }
      // Project metadata
      if (!response.error && Object.keys(formData.metadata || {}).length) {
        const metadataBody: AnswerSubmitRequest[] = [];
        let hasFileAnswer;
        Object.keys(formData.metadata).forEach((key) => {
          const answer = formData.metadata[key];
          const question = formData.questions.find((q) => q.uuid === key);
          if (answer && question.question_type === 'file') {
            hasFileAnswer = true;
          }
          metadataBody.push({
            question_uuid: question.uuid,
            answer_data: answer ?? null,
          });
        });
        try {
          await projectsSubmitAnswers({
            path: { uuid: response.data.uuid },
            body: metadataBody,
            ...(hasFileAnswer ? formDataOptions : {}),
          });
          showSuccess(translate('Project metadata submitted.'));
        } catch (err) {
          error = err;
          showErrorResponse(
            err,
            translate('Error while submitting project metadata'),
          );
        }
      }
      if (!error) {
        if (refetch) {
          await refetch();
        }
        closeDialog();
        router.stateService.go('project.dashboard', {
          uuid: response.data.uuid,
        });
      }
    } catch (e) {
      showErrorResponse(e, translate('Unable to create project.'));
    }
  };

  // Check if Customer has project metadata checklist configured
  const [selectedCustomer, setSelectedCustomer] = useState(customer);
  const WizardStepsData = useMemo(() => {
    if (selectedCustomer?.project_metadata_checklist) {
      return { steps, wizardForms: WizardForms };
    }
    return { steps: [steps[0]], wizardForms: [WizardForms[0]] };
  }, [selectedCustomer]);

  return (
    <Wizard<ProjectFormData>
      onSubmit={onSubmit}
      submitLabel={translate('Create')}
      steps={WizardStepsData.steps}
      wizardForms={WizardStepsData.wizardForms}
      title={translate('Create project')}
      subtitle={translate(
        'Provide the required information to set up a new project.',
      )}
      initialValues={{ customer: customer as { url: string } }}
      data={{
        initialCustomer: customer,
        selectedCustomer,
        setSelectedCustomer,
      }}
      modalProps={{
        bodyClassName: 'h-500px',
        iconNode: <PlusCircleIcon weight="bold" />,
        iconColor: 'success',
      }}
    />
  );
};
