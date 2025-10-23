import { Field } from 'react-final-form';
import { useSelector } from 'react-redux';

import { required } from '@waldur/core/validators';
import { SelectField } from '@waldur/form';
import { FormFieldError } from '@waldur/form/FormFieldError';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { getCustomer } from '@waldur/workspace/selectors';

import { useCustomerProjects } from '../workspace/fetchCustomer';

export const OrganizationProjectSelectField = ({ disabled = false }) => {
  const currentCustomer = useSelector(getCustomer);
  const { loading } = useCustomerProjects();

  return (
    <FormGroup label={translate('Project')} required>
      <Field
        name="project"
        component={SelectField as any}
        options={currentCustomer?.projects}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.url}
        isClearable={false}
        isDisabled={disabled}
        isLoading={loading}
        validate={required}
      />
      <FormFieldError name="project" />
    </FormGroup>
  );
};
