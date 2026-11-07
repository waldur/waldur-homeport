import { FC, useMemo } from 'react';

import { BooleanGroup } from '@/form';
import { translate } from '@/i18n';
import { WizardModal, WizardStepProps } from '@/wizard';

import { OfferViaCallStep } from './offerViaCall';
import { selectableSteps } from './offerViaCallForm';

/** Progress through the chain of API calls the last step sets off. */
const chainStepLabel = (step: OfferViaCallStep): string => {
  switch (step) {
    case 'organisation':
      return translate('Registering the managing organization');
    case 'call':
      return translate('Creating the call');
    case 'workflow':
      return translate('Configuring the workflow');
    case 'round':
      return translate('Opening a submission window');
    case 'offering':
      return translate('Adding the offering');
    case 'accept':
      return translate('Accepting the offering');
    case 'activate':
      return translate('Activating the call');
    default:
      return step;
  }
};

/** Checkboxes for the steps a new call is seeded with. */
export const WorkflowStepsField: FC<{ disabled?: boolean }> = ({
  disabled,
}) => {
  const steps = useMemo(selectableSteps, []);
  return (
    <>
      {steps.map((step) => (
        <BooleanGroup
          key={step.key}
          name={`steps.${step.key}`}
          label={step.name}
          description={step.description}
          disabled={disabled || step.mandatory}
          tooltip={
            step.mandatory
              ? translate('Every call ends in an allocation decision.')
              : undefined
          }
          space={1.5}
        />
      ))}
    </>
  );
};

/** The stages a request passes through before it can be granted. */
export const OfferViaCallWorkflowStep: FC<WizardStepProps> = (props) => {
  const { chainStep } = props.data;
  const busy = props.submitting;

  return (
    <WizardModal {...props}>
      <p className="text-quaternary mb-4">
        {translate(
          'Each enabled step is a stage someone has to clear before the request can be granted. The allocation decision alone is the shortest route.',
        )}
      </p>
      <WorkflowStepsField disabled={busy} />
      {chainStep && busy ? (
        <p className="text-quaternary text-xs mt-3 mb-0">
          {chainStepLabel(chainStep)}…
        </p>
      ) : null}
    </WizardModal>
  );
};
