import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Field, reduxForm, change } from 'redux-form';

import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { organizationAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { getUser, isStaffOrSupport } from '@waldur/workspace/selectors';

export const ORGANIZATION_FILTER_FORM = 'OrganizationSummaryFilter';

interface OrganizationFilterProps {
  change?: (field: string, value: unknown) => void;
}

/**
 * Organization filter for the Organization Summary report.
 *
 * Access control:
 * - Staff/Support users: Can select any organization
 * - Organization owners: Can only select their own organizations
 */
const PureOrganizationFilter: FC<OrganizationFilterProps> = () => {
  const user = useSelector(getUser);
  const canSelectAny = useSelector(isStaffOrSupport);
  const dispatch = useDispatch();

  // Get user's owned organizations
  const ownedOrganizations = user?.permissions
    ?.filter(
      (p) =>
        p.scope_type === 'customer' &&
        (p.role_name === 'CUSTOMER.OWNER' ||
          p.role_name === 'CUSTOMER.MANAGER'),
    )
    .map((p) => ({
      uuid: p.scope_uuid,
      name: p.scope_name,
    }));

  // If user is not staff/support and owns only one organization, auto-select it
  useEffect(() => {
    if (
      !canSelectAny &&
      ownedOrganizations?.length === 1 &&
      ownedOrganizations[0]
    ) {
      dispatch(
        change(ORGANIZATION_FILTER_FORM, 'organization', ownedOrganizations[0]),
      );
    }
  }, [canSelectAny, ownedOrganizations, dispatch]);

  // For non-staff users, only show their organizations
  const loadOptions = (query: string, prevOptions, page) => {
    if (canSelectAny) {
      // Staff/support can see all organizations
      return organizationAutocomplete(query, prevOptions, page);
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
        <AsyncPaginate
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
          className="metronic-select-container"
          classNamePrefix="metronic-select"
        />
      )}
    />
  );
};

export const OrganizationFilter = reduxForm({
  form: ORGANIZATION_FILTER_FORM,
  destroyOnUnmount: false,
})(PureOrganizationFilter);
