import { FunctionComponent } from 'react';
import { Field, useFormState } from 'react-final-form';

import { required } from '@/core/validators';
import { SelectField } from '@/form';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

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
    <FormGroup label={translate('Project')} required={isRequired}>
      <Field
        name="project"
        component={SelectField}
        options={customer.projects}
        isDisabled={disabled}
        isLoading={loading}
        getOptionValue={(option) => option.uuid}
        getOptionLabel={(option) => option.name}
        isClearable
        validate={isRequired ? required : undefined}
      />
    </FormGroup>
  );
};
