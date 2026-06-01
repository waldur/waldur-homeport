import { FC, useCallback, useMemo } from 'react';

import { required } from '@/core/validators';
import { AsyncSelectGroup } from '@/form';
import { translate } from '@/i18n';
import { useOrderFormData } from '@/marketplace/deploy/selectors';
import { ProjectCreateButton } from '@/project/create/ProjectCreateButton';
import { useSetProject } from '@/workspace/hooks';

import { projectAutocomplete } from '../common/autocompletes';

interface ProjectFieldProps {
  previewMode?: boolean;
  hideLabel?: boolean;
}

export const ProjectField: FC<ProjectFieldProps> = ({ previewMode }) => {
  const setCurrentProject = useSetProject();
  const { customer } = useOrderFormData();

  const loadOptions = useMemo(
    () =>
      projectAutocomplete(customer?.uuid, {
        // UUID is used in suggest name API request
        field: ['name', 'url', 'uuid', 'end_date'],
      }),
    [customer?.uuid],
  );

  const onChange = useCallback(
    (value) => {
      setCurrentProject(value);
    },
    [setCurrentProject],
  );

  return (
    <AsyncSelectGroup
      name="project"
      label={translate('Project')}
      validate={required}
      required={true}
      spaceless
      placeholder={
        customer
          ? translate('Select project...')
          : translate('Please select organization first')
      }
      noOptionsMessage={() => translate('No projects found')}
      loadOptions={loadOptions}
      onChange={onChange}
      getOptionValue={(option) => option.url}
      getOptionLabel={(option) => option.name}
      isClearable={false}
      isDisabled={!customer}
      quickAction={
        !previewMode && (
          <ProjectCreateButton
            customer={customer}
            title={translate('Add project')}
            variant="link"
            className="mb-1"
          />
        )
      }
    />
  );
};
