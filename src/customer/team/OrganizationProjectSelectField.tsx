import { Field as FinalField } from 'react-final-form';
import { useSelector } from 'react-redux';

import { required } from '@/core/validators';
import { FormGroupFinal, SelectField } from '@/form';
import { translate } from '@/i18n';
import { getCustomer } from '@/workspace/selectors';

import { useCustomerProjects } from '../workspace/fetchCustomer';

export const OrganizationProjectSelectField = ({ disabled = false }) => {
  const currentCustomer = useSelector(getCustomer);
  const { loading } = useCustomerProjects();

  return (
    <FinalField
      name="project"
      validate={required}
      component={FormGroupFinal}
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
    </FinalField>
  );
};
