import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import { FormGroup, SelectField } from '@/form';
import { translate } from '@/i18n';
import { useCustomer } from '@/workspace/hooks';

import { useCustomerProjects } from '../workspace/fetchCustomer';

export const OrganizationProjectSelectField = ({ disabled = false }) => {
  const currentCustomer = useCustomer();
  const { loading } = useCustomerProjects();

  return (
    <Field
      name="project"
      validate={required}
      component={FormGroup}
      label={translate('Project')}
      required
    >
      <SelectField
        options={currentCustomer?.projects || []}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.url}
        isClearable={false}
        isDisabled={disabled}
        isLoading={loading}
      />
    </Field>
  );
};
