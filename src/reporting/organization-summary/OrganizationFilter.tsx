import { FC, useEffect, useMemo } from 'react';
import { Field, useForm } from 'react-final-form';

import { AsyncSelect } from '@/form/select';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';
import { useUser } from '@/workspace/hooks';

/**
 * Organization filter for the Organization Summary report.
 *
 * Access control:
 * - Staff/Support users: Can select any organization
 * - Organization owners: Can only select their own organizations
 */
export const OrganizationFilter: FC = () => {
  const user = useUser();
  const canSelectAny = user?.is_staff || user?.is_support;
  const form = useForm();

  // Get user's owned organizations
  const ownedOrganizations = useMemo(
    () =>
      user?.permissions
        ?.filter(
          (p) =>
            p.scope_type === 'customer' &&
            (p.role_name === 'CUSTOMER.OWNER' ||
              p.role_name === 'CUSTOMER.MANAGER'),
        )
        .map((p) => ({
          uuid: p.scope_uuid,
          name: p.scope_name,
        })),
    [user?.permissions],
  );

  // If user is not staff/support and owns only one organization, auto-select it
  useEffect(() => {
    if (
      !canSelectAny &&
      ownedOrganizations?.length === 1 &&
      ownedOrganizations[0]
    ) {
      form.change('organization', ownedOrganizations[0]);
    }
  }, [canSelectAny, ownedOrganizations, form]);

  const loadOrganizations = useMemo(() => organizationAutocomplete(), []);

  // For non-staff users, only show their organizations
  const loadOptions = (query: string, prevOptions, page) => {
    if (canSelectAny) {
      // Staff/support can see all organizations
      return loadOrganizations(query, prevOptions, page);
    }

    // Non-staff users: filter to only their organizations
    const filtered = ownedOrganizations?.filter((org) =>
      org.name?.toLowerCase().includes(query.toLowerCase()),
    );

    return Promise.resolve({
      options: filtered || [],
      hasMore: false,
    });
  };

  return (
    <Field
      name="organization"
      component={(fieldProps) => (
        <AsyncSelect
          placeholder={translate('Select organization...')}
          loadOptions={loadOptions}
          defaultOptions
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.name}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          noOptionsMessage={() => translate('No organizations')}
          isClearable={canSelectAny}
          isDisabled={!canSelectAny && ownedOrganizations?.length === 1}
        />
      )}
    />
  );
};
