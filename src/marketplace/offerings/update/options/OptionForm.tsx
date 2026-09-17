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

export const OptionForm = ({
  resourceType,
  offering,
  optionKey,
}: {
  resourceType: 'options' | 'resource_options';
  offering;
  optionKey?: string;
}) => {
  const { values, errors } = useFormState({
    subscription: { values: true, errors: true },
  });
  const type = values.type?.value;
  const OptionComponent = OPTION_COMPONENTS[type];

  return (
    <>
      <DisplayNameField />
      <InternalNameField />
      <InternalNamePrefill source="label" target="name" />
      <StringGroup label={translate('Description')} name="help_text" />
      <OptionTypeGroup />
      {OptionComponent && <OptionComponent offering={offering} />}
      <VisibleIfConfiguration
        options={offering?.[resourceType]}
        optionKey={optionKey}
      />
      {resourceType === 'options' ? (
        <BooleanGroup name="required" label={translate('Required')} />
      ) : null}
      {errors?.dependents ? <FieldError error={errors.dependents} /> : null}
    </>
  );
};
