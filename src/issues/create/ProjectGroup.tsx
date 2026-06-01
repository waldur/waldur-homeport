import { useEffect, useMemo } from 'react';
import { useForm, useFormState } from 'react-final-form';

import { AsyncSelectGroup, SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { projectAutocomplete } from '@/marketplace/common/autocompletes';

export const ProjectGroup = ({ disabled }) => {
  const form = useForm();
  const { values } = useFormState();
  const customer = values.customer;
  const project = values.project;

  useEffect(() => {
    if (project && customer && project.customer_uuid !== customer.uuid) {
      form.change('project', undefined);
    }
  }, [form, customer, project]);

  const loadProjects = useMemo(
    () =>
      projectAutocomplete(customer?.uuid, {
        field: ['name', 'url', 'uuid', 'customer_uuid'],
      }),
    [customer?.uuid],
  );

  if (!disabled && customer) {
    return (
      <AsyncSelectGroup
        key={customer.uuid}
        name="project"
        label={translate('Project')}
        containerClassName="flex-equal"
        isClearable={true}
        defaultOptions
        loadOptions={loadProjects}
        getOptionValue={(option) => option.uuid}
        getOptionLabel={(option) => option.name}
        filterOption={null}
        isDisabled={disabled}
      />
    );
  }

  return (
    <SelectGroup
      name="project"
      label={translate('Project')}
      containerClassName="flex-equal"
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) => option.name}
      options={
        project
          ? [
              {
                name: project.name,
                uuid: project.uuid,
                url: project.url,
              },
            ]
          : []
      }
      isDisabled
    />
  );
};
