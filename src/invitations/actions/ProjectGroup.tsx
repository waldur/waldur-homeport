import { FunctionComponent } from 'react';
import { useFormState } from 'react-final-form';

import { required } from '@/core/validators';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';

export const ProjectGroup: FunctionComponent<{
  customer;
  loading?;
  disabled;
  required?;
}> = ({ customer, loading, disabled, required: isRequired = true }) => {
  const { values } = useFormState();
  const role = values?.role;
  const projectEnabled = role?.content_type === 'project';

  if (!projectEnabled) {
    return null;
  }

  return (
    <SelectGroup
      name="project"
      options={customer.projects}
      isDisabled={disabled}
      isLoading={loading}
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) => option.name}
      isClearable
      validate={isRequired ? required : undefined}
      label={translate('Project')}
      required={isRequired}
    />
  );
};
