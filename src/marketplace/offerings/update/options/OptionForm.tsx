import { useEffect } from 'react';
import { useForm, useFormState } from 'react-final-form';

import { required } from '@/core/validators';
import { BooleanGroup, SelectGroup, StringGroup } from '@/form';
import { FieldError } from '@/form/FieldError';
import { translate } from '@/i18n';

import { InternalNamePrefill } from '../../InternalNamePrefill';

import { ChoicesOptionConfig } from './ChoicesOptionConfig';
import { ComponentMultiplierConfiguration } from './ComponentMultiplierConfiguration';
import { ConditionalCascadeConfiguration } from './ConditionalCascadeConfiguration';
import { getFormulaOrderOptions } from './constants';
import {
  ComponentFormulaConfiguration,
  ComponentSumConfiguration,
} from './DerivedLimitConfiguration';
import { DisplayNameField } from './DisplayNameField';
import { InternalNameField } from './InternalNameField';
import { K8sDefaultsConfiguration } from './K8sDefaultsConfiguration';
import { NumericOptionConfig } from './NumericOptionConfig';
import { OptionTypeGroup } from './OptionTypeGroup';
import { PatternConfiguration } from './PatternConfiguration';
import { StorageFolderConfiguration } from './StorageFolderConfiguration';
import { StringOptionConfig } from './StringOptionConfig';
import { VisibleIfConfiguration } from './VisibleIfConfiguration';

// A formula resource option takes its formulas from the order option it pairs
// with, so it has no settings of its own.
export const hasOptionSettings = (
  type?: string,
  resourceType?: 'options' | 'resource_options',
) =>
  Boolean(type && type in OPTION_COMPONENTS) &&
  !(resourceType === 'resource_options' && type === 'component_formula');

// The default value and the pattern it must match belong on the same step.
const StringSettings = () => (
  <>
    <StringOptionConfig />
    <PatternConfiguration />
  </>
);

const OPTION_COMPONENTS = {
  integer: NumericOptionConfig,
  money: NumericOptionConfig,
  select_string: ChoicesOptionConfig,
  select_string_multi: ChoicesOptionConfig,
  string: StringSettings,
  text: PatternConfiguration,
  conditional_cascade: ConditionalCascadeConfiguration,
  component_multiplier: ComponentMultiplierConfiguration,
  component_formula: ComponentFormulaConfiguration,
  component_sum: ComponentSumConfiguration,
  storage_folder_manager: StorageFolderConfiguration,
  single_datacenter_k8s_config: K8sDefaultsConfiguration,
  multi_datacenter_k8s_config: K8sDefaultsConfiguration,
};

/**
 * The internal name. A formula resource option shares it with the order
 * option whose value it changes, so it is picked from those instead.
 */
const NameFields = ({
  resourceType,
  offering,
  optionKey,
}: {
  resourceType: 'options' | 'resource_options';
  offering;
  optionKey?: string;
}) => {
  const { values } = useFormState({ subscription: { values: true } });
  const form = useForm();
  const pairing =
    resourceType === 'resource_options' &&
    values.type?.value === 'component_formula';
  // One resource option per order option: those already paired are left
  // out, except the one being edited.
  const candidates = getFormulaOrderOptions(offering).filter(
    (candidate) =>
      candidate.value === optionKey ||
      !offering?.resource_options?.options?.[candidate.value],
  );
  const stale =
    pairing &&
    values.name &&
    !candidates.some((candidate) => candidate.value === values.name);
  // A name typed or prefilled before the type changed would be kept, unseen,
  // and pair with nothing.
  useEffect(() => {
    if (stale) {
      form.change('name', undefined);
    }
  }, [form, stale]);
  if (pairing) {
    return (
      <SelectGroup
        name="name"
        label={translate('Order option')}
        description={
          optionKey
            ? translate(
                'Resources keep their values under this name, so it cannot be changed. To pair with another order option, delete this option and add a new one.',
              )
            : translate(
                'The Component Formula order option whose value customers can change after ordering.',
              )
        }
        required
        validate={required}
        options={candidates}
        isClearable={false}
        isDisabled={Boolean(optionKey)}
        simpleValue
      />
    );
  }
  return (
    <>
      <InternalNameField />
      <InternalNamePrefill source="label" target="name" />
    </>
  );
};

// A sum has nothing for the customer to fill in, so it cannot be required.
const RequiredGroup = () => {
  const { values } = useFormState({ subscription: { values: true } });
  return values.type?.value === 'component_sum' ? null : (
    <BooleanGroup name="required" label={translate('Required')} />
  );
};

// Not a registered field, and it is raised by the type on the first step while
// the choices that can break it live on the second, so both steps show it.
const DependentsError = () => {
  const { errors } = useFormState({ subscription: { errors: true } });
  return errors?.dependents ? <FieldError error={errors.dependents} /> : null;
};

/**
 * First step: the option itself. Everything the dialog used to show up front
 * stays here — including the visibility rule and the Required switch, which
 * apply to every type and must not be a step away.
 */
export const OptionBasicsForm = ({
  resourceType,
  offering,
  optionKey,
}: {
  resourceType: 'options' | 'resource_options';
  offering;
  optionKey?: string;
}) => (
  <>
    <DisplayNameField />
    <NameFields
      resourceType={resourceType}
      offering={offering}
      optionKey={optionKey}
    />
    <StringGroup label={translate('Description')} name="help_text" />
    <OptionTypeGroup resourceType={resourceType} offering={offering} />
    <VisibleIfConfiguration
      options={offering?.[resourceType]}
      optionKey={optionKey}
    />
    {resourceType === 'options' ? <RequiredGroup /> : null}
    <DependentsError />
  </>
);

/**
 * Second step: the settings of the chosen type. The wizard only adds this step
 * for types that have settings (see `hasOptionSettings`).
 */
export const OptionSettingsForm = ({ offering }: { offering }) => {
  const { values } = useFormState({ subscription: { values: true } });
  const OptionComponent = OPTION_COMPONENTS[values.type?.value];

  if (!OptionComponent) {
    return null;
  }

  return (
    <>
      <OptionComponent offering={offering} />
      <DependentsError />
    </>
  );
};
