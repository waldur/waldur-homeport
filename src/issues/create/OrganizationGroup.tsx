import { useMemo } from 'react';

import { required } from '@/core/validators';
import { AsyncSelectGroup } from '@/form';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';

export const OrganizationGroup = ({ disabled }) => {
  const loadOrganizations = useMemo(
    () =>
      organizationAutocomplete({
        field: ['name', 'uuid', 'url'],
        o: 'name',
      }),
    [],
  );

  return (
    <AsyncSelectGroup
      name="customer"
      label={translate('Organization')}
      validate={!disabled ? required : undefined}
      containerClassName="flex-equal"
      defaultOptions
      loadOptions={loadOrganizations}
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.uuid}
      isDisabled={disabled}
    />
  );
};
