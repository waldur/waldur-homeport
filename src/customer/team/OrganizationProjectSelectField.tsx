import { Field as FinalField } from 'react-final-form';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';

import { required } from '@/core/validators';
import { FieldError, SelectField } from '@/form';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { getCustomer } from '@/workspace/selectors';

import { useCustomerProjects } from '../workspace/fetchCustomer';

export const OrganizationProjectSelectField = ({
  disabled = false,
  legacyField = false,
}) => {
  const currentCustomer = useSelector(getCustomer);
  const { loading } = useCustomerProjects();

  const Component = (legacyField ? Field : FinalField) as any;

  const Select = ({ input, meta }) => (
    <>
      <SelectField
        input={input}
        options={currentCustomer?.projects}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.url}
        isClearable={false}
        isDisabled={disabled}
        isLoading={loading}
        isInvalid={meta.touched && meta.error}
      />
      {meta.touched && meta.error && <FieldError error={meta.error} />}
    </>
  );

  return (
    <FormGroup label={translate('Project')} required>
      <Component
        name="project"
        validate={required}
        {...(legacyField ? { component: Select } : { render: Select })}
      />
    </FormGroup>
  );
};
