import arrayMutators from 'final-form-arrays';
import { FC, useMemo } from 'react';

import { translate } from '@/i18n';
import { ProgressStep, Wizard, WizardModal, WizardStepProps } from '@/wizard';

import {
  hasOptionSettings,
  OptionBasicsForm,
  OptionSettingsForm,
} from './OptionForm';

const optionStep: ProgressStep = {
  key: 'option',
  label: translate('Option'),
  completed: false,
};
const settingsStep: ProgressStep = {
  key: 'settings',
  label: translate('Settings'),
  completed: false,
};

// Types without settings of their own have nothing to show on a second step,
// so the dialog submits straight from the first one. When there is a second
// step the wizard shows its step indicator: without it the first step looks
// like the whole form, and the type's settings behind "Next" go unnoticed.
const getSteps = (values) =>
  hasOptionSettings(values?.type?.value)
    ? [optionStep, settingsStep]
    : [optionStep];

// Both steps share the same floor height, so the dialog keeps its size when
// it moves between them: the settings of most types are shorter than the
// basics, and the modal used to shrink under the cursor. Sized for the
// option step at its tallest -- a visibility rule row plus the dependents
// error -- so that step never pushes past it.
const STEP_HEIGHT = 'min-h-550px';

const OptionStep: FC<WizardStepProps> = (props) => {
  const { resourceType, offering, optionKey } = props.data;
  return (
    <WizardModal {...props}>
      <div className={STEP_HEIGHT}>
        <OptionBasicsForm
          resourceType={resourceType}
          offering={offering}
          optionKey={optionKey}
        />
      </div>
    </WizardModal>
  );
};

const SettingsStep: FC<WizardStepProps> = (props) => (
  <WizardModal {...props}>
    <div className={STEP_HEIGHT}>
      <OptionSettingsForm offering={props.data.offering} />
    </div>
  </WizardModal>
);

const wizardForms = [OptionStep, SettingsStep];

interface OptionWizardProps {
  title: string;
  submitLabel: string;
  initialValues;
  validate(values): any;
  onSubmit(values): Promise<any>;
  resourceType: 'options' | 'resource_options';
  offering;
  optionKey?: string;
}

export const OptionWizard: FC<OptionWizardProps> = (props) => {
  const data = useMemo(
    () => ({
      resourceType: props.resourceType,
      offering: props.offering,
      optionKey: props.optionKey,
    }),
    [props.resourceType, props.offering, props.optionKey],
  );

  return (
    <Wizard
      title={props.title}
      submitLabel={props.submitLabel}
      steps={getSteps}
      wizardForms={wizardForms}
      onSubmit={props.onSubmit}
      initialValues={props.initialValues}
      validate={props.validate}
      mutators={{ ...arrayMutators }}
      data={data}
    />
  );
};
