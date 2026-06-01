import { useFormState } from 'react-final-form';

import { BooleanGroup, StringGroup } from '@/form';
import { translate } from '@/i18n';

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

export const OptionForm = ({ resourceType, offering }) => {
  const { values } = useFormState({
    subscription: { values: true },
  });
  const type = values.type?.value;
  const OptionComponent = OPTION_COMPONENTS[type];

  return (
    <>
      <InternalNameField />
      <DisplayNameField />
      <StringGroup label={translate('Description')} name="help_text" />
      <OptionTypeGroup />
      {OptionComponent && <OptionComponent offering={offering} />}
      {resourceType === 'options' ? (
        <BooleanGroup name="required" label={translate('Required')} />
      ) : null}
    </>
  );
};
