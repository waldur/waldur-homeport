import { useEffect, useMemo } from 'react';
import { Field, useFormState, useForm } from 'react-final-form';

import { FormGroup } from '@/form';
import { AsyncSelect as AsyncSelectField } from '@/form/select';
import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { projectAutocomplete } from '@/marketplace/common/autocompletes';

const StaticProjectSelect = ({
  input,
  project,
}: {
  input?: any;
  project: any;
}) => (
  <Select
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
    value={input?.value}
    isDisabled
  />
);

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

  return (
    <Field
      name="project"
      component={FormGroup}
      label={translate('Project')}
      containerClassName="flex-equal"
    >
      {!disabled && customer ? (
        <AsyncSelectField
          isClearable={true}
          defaultOptions
          loadOptions={loadProjects}
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.name}
          filterOption={null}
          isDisabled={disabled}
          key={customer.uuid}
        />
      ) : (
        <StaticProjectSelect project={project} />
      )}
    </Field>
  );
};
