import { FC, useCallback, useMemo } from 'react';
import { Field, useForm } from 'react-final-form';
import {
  CustomersListData,
  Offering,
  ProjectsListData,
  projectsList,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { FormGroup } from '@/form';
import { AsyncSelect } from '@/form/select';
import { formatJsxTemplate, translate } from '@/i18n';
import { useOrderFormData } from '@/marketplace/deploy/selectors';
import { getOfferingRestrictedRoles } from '@/marketplace/offerings/utils';
import { useModal } from '@/modal/actions';

import { organizationAutocomplete } from '../common/autocompletes';

const CustomerSelect = ({ input, organizationGroups, offering }) => {
  const { confirm } = useModal();

  const form = useForm();
  const { customer } = useOrderFormData();

  const preselectSoleProject = useCallback(
    async (customerUuid) => {
      const query: ProjectsListData['query'] = { customer: customerUuid };
      const roles = offering ? getOfferingRestrictedRoles(offering) : [];
      if (roles.length) {
        query.current_user_has_role = roles;
      }
      const projects = await projectsList({ query }).then((r) => r.data);
      // Preselect only when there is nothing to decide. Picking the first of
      // several would place the order in an arbitrary project. Clearing is
      // deliberate: the previous organization's project must not survive.
      form.change('project', projects.length === 1 ? projects[0] : undefined);
    },
    [offering, form],
  );

  const onChange = useCallback(
    async (value) => {
      if (!customer) {
        input.onChange(value);
        await preselectSoleProject(value.uuid);
        return;
      }
      try {
        await confirm(
          translate('Organization change'),
          translate(
            "You're switching to the {name} organization. This will discard any entered data. Do you want to proceed?",
            { name: <strong>{value.name}</strong> },
            formatJsxTemplate,
          ),
          {
            negativeButton: translate('Cancel'),
            positiveButton: translate('Confirm'),
            size: 'sm',
          },
        );
        input.onChange(value);
        await preselectSoleProject(value.uuid);
      } catch {
        // Swallow
      }
    },
    [customer, input, preselectSoleProject],
  );

  const loadOptions = useMemo(() => {
    const extra: CustomersListData['query'] = {
      organization_group_uuid: organizationGroups.map((group) => group.uuid),
      field: [
        'name',
        'uuid',
        'url',
        'payment_profiles',
        'display_billing_info_in_projects',
      ],
      o: 'name',
    };
    const roles = offering ? getOfferingRestrictedRoles(offering) : [];
    if (roles.length) {
      // Only offer organizations where the user holds one of the required roles.
      extra.current_user_has_role = roles;
    }
    return organizationAutocomplete(extra);
  }, [organizationGroups, offering]);

  return (
    <AsyncSelect
      value={input.value}
      onChange={onChange}
      placeholder={translate('Select organization...')}
      loadOptions={loadOptions}
      noOptionsMessage={() => translate('No organizations found')}
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.uuid}
    />
  );
};

export const CustomerField: FC<{
  organizationGroups;
  offering?: Offering;
}> = ({ organizationGroups, offering }) => {
  return (
    <FormGroup label={translate('Organization')} required={true} spaceless>
      <Field name="customer" validate={required}>
        {(fieldProps) => (
          <CustomerSelect
            {...fieldProps}
            organizationGroups={organizationGroups}
            offering={offering}
          />
        )}
      </Field>
    </FormGroup>
  );
};
