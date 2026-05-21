import { useEffect } from 'react';
import { Field, useFormState, useForm } from 'react-final-form';

import { FormGroup } from '@/form';
import { Select as AsyncSelectField } from '@/form/AsyncSelectField';
import { Select } from '@/form/themed-select';
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
          loadOptions={(query, prevOptions, page) =>
            projectAutocomplete(customer.uuid, query, prevOptions, page, {
              field: ['name', 'url', 'uuid', 'customer_uuid'],
            })
          }
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.name}
          filterOption={(options) => options}
          isDisabled={disabled}
          key={customer.uuid}
        />
      ) : (
        <StaticProjectSelect project={project} />
      )}
    </Field>
  );
};
