import { useEffect } from 'react';
import { useForm, useFormState } from 'react-final-form';

import { AsyncSelectGroup, SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { resourceAutocomplete } from '@/marketplace/common/autocompletes';
import { NON_TERMINATED_STATES } from '@/marketplace/resources/list/constants';
import { formatResourceShort } from '@/marketplace/utils';

export const ResourceGroup = ({ disabled }) => {
  const { change } = useForm();
  const { values } = useFormState();
  const project = values.project;
  const resource = values.resource;

  useEffect(() => {
    if (resource && project && resource.project_uuid !== project.uuid) {
      change('resource', undefined);
    }
  }, [change, project, resource]);

  if (project) {
    return (
      <AsyncSelectGroup
        key={project.uuid}
        name="resource"
        label={translate('Affected resource')}
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
      />
    );
  }

  return (
    <SelectGroup
      name="resource"
      label={translate('Affected resource')}
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
      isDisabled
    />
  );
};
