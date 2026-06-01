import { required } from '@/core/validators';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { useCustomer } from '@/workspace/hooks';

import { useCustomerProjects } from '../workspace/fetchCustomer';

export const OrganizationProjectSelectField = ({ disabled = false }) => {
  const currentCustomer = useCustomer();
  const { loading } = useCustomerProjects();

  return (
    <SelectGroup
      name="project"
      validate={required}
      label={translate('Project')}
      required
      options={currentCustomer?.projects || []}
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.url}
      isClearable={false}
      isDisabled={disabled}
      isLoading={loading}
    />
  );
};
