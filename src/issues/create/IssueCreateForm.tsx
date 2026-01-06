import { WarningIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';

import { ProgressStep } from '@waldur/core/ProgressSteps';
import { translate } from '@waldur/i18n';
import { StepsList } from '@waldur/marketplace/common/StepsList';
import { useWizard } from '@waldur/marketplace/offerings/import/useWizard';
import { WizardButtons } from '@waldur/marketplace/offerings/import/WizardButtons';
import { WizardTabs } from '@waldur/marketplace/offerings/import/WizardTabs';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { getUser } from '@waldur/workspace/selectors';

import { useRequestTypes } from '../api';
import { IssueCreateButtonProps } from '../list/IssueCreateButton';
import { mapRequestTypesToChoices } from '../types/constants';
import { filterIssueTypes, getShowAllTypes } from '../types/utils';

import { ISSUE_CREATION_FORM_ID } from './constants';
import { IssueDescriptionTab } from './IssueDescriptionTab';
import { IssueDetailsStepLabel } from './IssueDetailsStepLabel';
import { IssueDetailsTab } from './IssueDetailsTab';
import { IssueFormData } from './types';

interface OwnProps {
  onCreateIssue(formData: IssueFormData): void;
  resolve: IssueCreateButtonProps;
}

const steps: ProgressStep[] = [
  {
    key: 'details',
    label: <IssueDetailsStepLabel />,
    description: [translate('Define issue type and context')],
    completed: true,
  },
  {
    key: 'description',
    label: translate('Description'),
    description: [translate('Add title, description, and attachments')],
    completed: false,
  },
];

const tabs = {
  details: IssueDetailsTab,
  description: IssueDescriptionTab,
};

export const IssueCreateForm = reduxForm<IssueFormData, OwnProps>({
  form: ISSUE_CREATION_FORM_ID,
})(({ onCreateIssue, handleSubmit, submitting, invalid, resolve }) => {
  const { step, setStep, goBack, goNext, isFirstStep, isLastStep } =
    useWizard(steps);

  // Fetch request types at form level to control wizard navigation
  const user = useSelector(getUser);
  const showAllTypes = getShowAllTypes(user);
  const { data: requestTypes, isLoading, error } = useRequestTypes();

  const issueTypes = useMemo(() => {
    if (!requestTypes) return [];
    const choices = mapRequestTypesToChoices(requestTypes);
    return filterIssueTypes(choices, showAllTypes);
  }, [requestTypes, showAllTypes]);

  // Block Next button if no request types available
  const canProceed = !isLoading && !error && issueTypes.length > 0;

  // Extended context with request types data
  const extendedContext = useMemo(
    () => ({
      ...resolve,
      requestTypes,
      issueTypes,
      isLoading,
      error,
    }),
    [resolve, requestTypes, issueTypes, isLoading, error],
  );

  return (
    <form onSubmit={handleSubmit(onCreateIssue)}>
      <ModalDialog
        title={translate('Create support request')}
        subtitle={translate(
          'Use this modal to describe your problem or request, so our support team can assist you.',
        )}
        iconNode={<WarningIcon weight="bold" />}
        iconColor="warning"
        footer={
          <WizardButtons
            isLastStep={isLastStep}
            isFirstStep={isFirstStep}
            goBack={goBack}
            goNext={goNext}
            submitting={submitting}
            invalid={invalid || !canProceed}
            submitLabel={translate('Create')}
          />
        }
        className="overflow-hidden"
      >
        <StepsList
          steps={steps}
          value={step}
          onClick={setStep}
          disabled={submitting}
        />

        <WizardTabs
          steps={steps}
          currentStep={step}
          tabs={tabs}
          mountOnEnter={true}
          context={extendedContext}
        />
      </ModalDialog>
    </form>
  );
});
