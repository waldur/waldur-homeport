import { useFormState } from 'react-final-form';

import { BooleanGroup, StringGroup } from '@/form';
import { FieldError } from '@/form/FieldError';
import { translate } from '@/i18n';

import { InternalNamePrefill } from '../../InternalNamePrefill';

import { ChoicesOptionConfig } from './ChoicesOptionConfig';
import { ComponentMultiplierConfiguration } from './ComponentMultiplierConfiguration';
import { ConditionalCascadeConfiguration } from './ConditionalCascadeConfiguration';
import { DisplayNameField } from './DisplayNameField';
import { InternalNameField } from './InternalNameField';
import { K8sDefaultsConfiguration } from './K8sDefaultsConfiguration';
import { NumericOptionConfig } from './NumericOptionConfig';
import { OptionTypeGroup } from './OptionTypeGroup';
import { StorageFolderConfiguration } from './StorageFolderConfiguration';
import { StringOptionConfig } from './StringOptionConfig';
import { VisibleIfConfiguration } from './VisibleIfConfiguration';

export const hasOptionSettings = (type?: string) =>
  Boolean(type && type in OPTION_COMPONENTS);

const OPTION_COMPONENTS = {
  integer: NumericOptionConfig,
  money: NumericOptionConfig,
  select_string: ChoicesOptionConfig,
  select_string_multi: ChoicesOptionConfig,
  string: StringOptionConfig,
  conditional_cascade: ConditionalCascadeConfiguration,
  component_multiplier: ComponentMultiplierConfiguration,
  storage_folder_manager: StorageFolderConfiguration,
  single_datacenter_k8s_config: K8sDefaultsConfiguration,
  multi_datacenter_k8s_config: K8sDefaultsConfiguration,
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
    <InternalNameField />
    <InternalNamePrefill source="label" target="name" />
    <StringGroup label={translate('Description')} name="help_text" />
    <OptionTypeGroup />
    <VisibleIfConfiguration
      options={offering?.[resourceType]}
      optionKey={optionKey}
    />
    {resourceType === 'options' ? (
      <BooleanGroup name="required" label={translate('Required')} />
    ) : null}
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
