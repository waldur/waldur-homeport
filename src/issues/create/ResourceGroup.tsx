import { useEffect } from 'react';
import { Field, useForm, useFormState } from 'react-final-form';

import { FormGroup } from '@/form';
import { AsyncSelect as AsyncSelectField, Select } from '@/form/select';
import { translate } from '@/i18n';
import { resourceAutocomplete } from '@/marketplace/common/autocompletes';
import { NON_TERMINATED_STATES } from '@/marketplace/resources/list/constants';
import { formatResourceShort } from '@/marketplace/utils';

const StaticResourceSelect = ({
  input,
  resource,
}: {
  input?: any;
  resource: any;
}) => (
  <Select
    getOptionValue={(option) => option.uuid}
    getOptionLabel={(option) => formatResourceShort(option)}
    options={
      resource
        ? [
            {
              name: resource.name,
              uuid: resource.uuid,
              url: resource.url,
              offering_name: resource.offering_name,
            },
          ]
        : []
    }
    value={input?.value}
    isDisabled
  />
);

export const ResourceGroup = ({ disabled }) => {
  const form = useForm();
  const { values } = useFormState();
  const project = values.project;
  const resource = values.resource;

  useEffect(() => {
    if (resource && project && resource.project_uuid !== project.uuid) {
      form.change('resource', undefined);
    }
  }, [form, project, resource]);

  return (
    <Field
      name="resource"
      component={FormGroup}
      label={translate('Affected resource')}
    >
      {project ? (
        <AsyncSelectField
          isClearable={true}
          defaultOptions
          loadOptions={resourceAutocomplete({
            project_uuid: project.uuid,
            field: ['name', 'url', 'uuid', 'offering_name', 'project_uuid'],
            state: NON_TERMINATED_STATES,
          })}
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => formatResourceShort(option)}
          filterOption={null}
          isDisabled={disabled}
          key={project.uuid}
        />
      ) : (
        <StaticResourceSelect resource={resource} />
      )}
    </Field>
  );
};
