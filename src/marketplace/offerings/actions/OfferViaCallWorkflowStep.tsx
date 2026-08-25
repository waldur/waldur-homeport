import { FC, useCallback, useMemo } from 'react';
import { useForm, useFormState } from 'react-final-form';

import { BooleanGroup } from '@/form';
import { translate } from '@/i18n';
import {
  getDependentSteps,
  getEnabledStepIds,
  getMissingDependencies,
  stepLabel,
} from '@/proposals/workflow/constants';
import { WizardModal, WizardStepProps } from '@/wizard';

import { OfferViaCallStep } from './offerViaCall';
import { OfferViaCallFormData, selectableSteps } from './offerViaCallForm';

/** Progress through the chain of API calls the last step sets off. */
const chainStepLabel = (step: OfferViaCallStep): string => {
  switch (step) {
    case 'organisation':
      return translate('Registering the managing organisation');
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

/**
 * Checkboxes for the call's workflow, honouring the catalogue's dependencies
 * the way the call configuration screens do: a step whose dependency is off
 * cannot be switched on — the panel review consolidates expert reviews, so
 * turning it on for the operator would be deciding for them that the call
 * runs an expert review too. Switching a dependency back off still cascades,
 * because the alternative is a dependent the backend would refuse to activate.
 */
export const WorkflowStepsField: FC<{ disabled?: boolean }> = ({
  disabled,
}) => {
  const form = useForm();
  const { values } = useFormState<OfferViaCallFormData>({
    subscription: { values: true },
  });
  const definitions = useMemo(selectableSteps, []);

  const enabled = useMemo(
    () =>
      getEnabledStepIds(
        Object.entries(values.steps || {}).map(([step, is_enabled]) => ({
          step: step as any,
          is_enabled,
        })),
      ),
    [values.steps],
  );

  const cascadeOff = useCallback(
    (definition) => {
      getDependentSteps(definition.id).forEach((id) =>
        form.change(`steps.${id}`, false),
      );
    },
    [form],
  );

  return (
    <>
      {definitions.map((definition) => {
        const missing = getMissingDependencies(definition.id, enabled);
        const blocked = missing.length > 0 && !enabled.has(definition.id);
        return (
          <BooleanGroup
            key={definition.id}
            name={`steps.${definition.id}`}
            label={definition.name}
            description={definition.description}
            disabled={disabled || definition.mandatory || blocked}
            tooltip={
              definition.mandatory
                ? translate('Every call ends in an allocation decision.')
                : blocked
                  ? translate('Enable {steps} first.', {
                      steps: missing.map(stepLabel).join(', '),
                    })
                  : undefined
            }
            onChange={(checked: boolean) => {
              if (!checked) {
                cascadeOff(definition);
              }
            }}
            space={2}
          />
        );
      })}
    </>
  );
};

/** The stages a request passes through before it can be granted. */
export const OfferViaCallWorkflowStep: FC<WizardStepProps> = (props) => {
  const { chainStep } = props.data;
  const busy = props.submitting;

  return (
    <WizardModal {...props}>
      <p className="text-muted mb-5">
        {translate(
          'Each enabled step is a stage someone has to clear before the request can be granted. The allocation decision alone is the shortest route.',
        )}
      </p>
      <WorkflowStepsField disabled={busy} />
      {chainStep && busy ? (
        <p className="text-muted fs-7 mt-4 mb-0">
          {chainStepLabel(chainStep)}…
        </p>
      ) : null}
    </WizardModal>
  );
};
