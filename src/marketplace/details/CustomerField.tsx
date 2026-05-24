import { FC, useCallback, useMemo } from 'react';
import { Field, useForm } from 'react-final-form';
import { projectsList } from 'waldur-js-client';

import { required } from '@/core/validators';
import { AsyncSelect } from '@/form/select';
import { formatJsxTemplate, translate } from '@/i18n';
import { useOrderFormData } from '@/marketplace/deploy/selectors';
import { useModal } from '@/modal/actions';

import { organizationAutocomplete } from '../common/autocompletes';
import { FormGroup } from '../offerings/FormGroup';

const CustomerSelect = ({ input, organizationGroups }) => {
  const { confirm } = useModal();

  const form = useForm();
  const { customer } = useOrderFormData();

  const onChange = useCallback(
    async (value) => {
      if (!customer) {
        input.onChange(value);
        const project = await projectsList({
          query: {
            customer: value.uuid,
          },
        }).then((r) => r.data[0]);
        form.change('project', project);
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
        const project = await projectsList({
          query: {
            customer: value.uuid,
          },
        }).then((r) => r.data[0]);
        form.change('project', project);
      } catch {
        // Swallow
      }
    },
    [customer, form, input],
  );

  const loadOptions = useMemo(
    () =>
      organizationAutocomplete({
        organization_group_uuid: organizationGroups.map((group) => group.uuid),
        field: [
          'name',
          'uuid',
          'url',
          'payment_profiles',
          'display_billing_info_in_projects',
        ],
        o: 'name',
      }),
    [organizationGroups],
  );

  return (
    <AsyncSelect
      label={translate('Organization')}
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
}> = ({ organizationGroups }) => {
  return (
    <FormGroup label={translate('Organization')} required={true} spaceless>
      <Field name="customer" validate={required}>
        {(fieldProps) => (
          <CustomerSelect
            {...fieldProps}
            organizationGroups={organizationGroups}
          />
        )}
      </Field>
    </FormGroup>
  );
};
