import { FC, useMemo } from 'react';

import { ENV } from '@/core/config';
import { required } from '@/core/validators';
import {
  StringGroup,
  BooleanGroup,
  SelectGroup,
  AsyncSelectGroup,
  CommaSeparatedListGroup,
} from '@/form';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';
import { Role } from '@/permissions/types';
import { getProjectRoles } from '@/permissions/utils';

import { validateEmailPatterns } from './utils';

export const RuleForm: FC<{ values; change }> = ({ values, change }) => {
  const protectedMethods =
    ENV.plugins.WALDUR_CORE.PROTECT_USER_DETAILS_FOR_REGISTRATION_METHODS || [];
  const loadOrganizations = useMemo(
    () =>
      organizationAutocomplete({
        field: ['name', 'url'],
        o: 'name',
      }),
    [],
  );
  return (
    <>
      <StringGroup
        name="name"
        placeholder={translate('e.g. Default users')}
        validate={required}
        label={translate('Rule name')}
        required
      />
      <CommaSeparatedListGroup
        label={translate('Affiliations')}
        name="user_affiliations"
        placeholder="student, faculty, researcher (comma-separated)"
        description={translate('Enter comma-separated affiliation identifiers')}
      />
      <CommaSeparatedListGroup
        label={translate('Email patterns')}
        name="user_email_patterns"
        placeholder={translate('e.g. .*@example.com')}
        description={translate(
          'Enter space separated regex pattern to match user email',
        )}
        separator="space"
        validate={validateEmailPatterns}
      />
      <BooleanGroup
        name="use_user_organization_as_customer_name"
        label={translate('Use user organization as customer name')}
        tooltip={translate(
          'If enabled, the customer name will be taken from the user’s organization provided by IdP.',
        )}
        tooltipEnd
        alignMiddle
        className="w-100"
        onChange={() => change('customer', null)}
      />
      {values.use_user_organization_as_customer_name && (
        <div className="alert alert-info py-2 px-3 mb-5">
          <div>
            {translate(
              'The organization is matched by exact name against the user.organization claim from the identity provider. The user must also be registered through a method listed in PROTECT_USER_DETAILS_FOR_REGISTRATION_METHODS.',
            )}
          </div>
          {protectedMethods.length === 0 ? (
            <div className="fw-semibold mt-2">
              {translate(
                'Warning: PROTECT_USER_DETAILS_FOR_REGISTRATION_METHODS is empty — no user will currently match.',
              )}
            </div>
          ) : (
            <div className="text-muted small mt-1">
              {translate('Protected registration methods: {methods}', {
                methods: protectedMethods.join(', '),
              })}
            </div>
          )}
        </div>
      )}
      <AsyncSelectGroup
        name="customer"
        label={translate('Organization')}
        required={!values.use_user_organization_as_customer_name}
        loadOptions={loadOrganizations}
        getOptionValue={({ url }) => url}
        isDisabled={values.use_user_organization_as_customer_name}
        isClearable
      />
      <SelectGroup
        name="project_role"
        options={getProjectRoles()}
        getOptionLabel={(role: Role) => role.description || role.name}
        getOptionValue={({ name }) => name}
        validate={required}
        simpleValue
        label={translate('Project role')}
        required
      />
    </>
  );
};
