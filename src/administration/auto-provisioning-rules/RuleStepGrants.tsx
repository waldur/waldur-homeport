import { FC, useMemo } from 'react';
import { useForm, useFormState } from 'react-final-form';

import { ENV } from '@/core/config';
import { AsyncSelectGroup, BooleanGroup, SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';
import { Role } from '@/permissions/types';
import {
  formatRoleLabel,
  getAmbiguousRoleDescriptions,
  getCustomerRoles,
  getProjectRoles,
} from '@/permissions/utils';
import { WizardForm, WizardFormStepProps } from '@/wizard';

import { validateRuleGrant, validateRuleOrganization } from './utils';

/** Step 2: what a matched user gets, and where. */
export const RuleStepGrants: FC<WizardFormStepProps> = (props) => {
  const { values } = useFormState({ subscription: { values: true } });
  const { change } = useForm();
  const protectedMethods =
    ENV.plugins.WALDUR_CORE.PROTECT_USER_DETAILS_FOR_REGISTRATION_METHODS || [];
  const loadOrganizations = useMemo(
    () => organizationAutocomplete({ field: ['name', 'url'], o: 'name' }),
    [],
  );
  const projectRoles = useMemo(
    () => getProjectRoles().filter((role) => role.is_system_role),
    [],
  );
  const ambiguousRoles = useMemo(
    () => getAmbiguousRoleDescriptions(projectRoles),
    [projectRoles],
  );
  const customerRoles = useMemo(
    () => getCustomerRoles().filter((role) => role.is_system_role),
    [],
  );
  const ambiguousCustomerRoles = useMemo(
    () => getAmbiguousRoleDescriptions(customerRoles),
    [customerRoles],
  );

  return (
    <WizardForm {...props}>
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
        getOptionLabel={(option) => option.name}
        isDisabled={values.use_user_organization_as_customer_name}
        isClearable
        validate={validateRuleOrganization}
      />
      {/* Only deployment-wide (system) roles are offered: an auto-provisioning
          rule applies across users/organizations, and an organization-specific
          clone would fail to grant outside its owning organization. */}
      <SelectGroup
        name="customer_role"
        options={customerRoles}
        getOptionLabel={(role: Role) =>
          formatRoleLabel(role, ambiguousCustomerRoles)
        }
        getOptionValue={({ name }) => name}
        simpleValue
        isClearable
        label={translate('Organization role')}
        description={translate(
          'Granted on the organization itself. Leave empty to grant no organization-level role.',
        )}
        validate={validateRuleGrant}
      />
      <BooleanGroup
        name="create_project"
        label={translate('Create a project')}
        tooltip={translate(
          'Create (or join) a project for each matched user. Disable for a rule that only grants an organization role.',
        )}
        tooltipEnd
        alignMiddle
        className="w-100"
      />
      {values.create_project !== false && (
        <SelectGroup
          name="project_role"
          options={projectRoles}
          getOptionLabel={(role: Role) => formatRoleLabel(role, ambiguousRoles)}
          getOptionValue={({ name }) => name}
          simpleValue
          isClearable
          label={translate('Project role')}
        />
      )}
    </WizardForm>
  );
};
