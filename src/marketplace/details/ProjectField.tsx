import { FC, useCallback, useMemo } from 'react';
import { Offering, ProjectsListData } from 'waldur-js-client';

import { required } from '@/core/validators';
import { AsyncSelectGroup } from '@/form';
import { translate } from '@/i18n';
import { useOrderFormData } from '@/marketplace/deploy/selectors';
import { getOfferingRestrictedRoles } from '@/marketplace/offerings/utils';
import { ProjectCreateButton } from '@/project/create/ProjectCreateButton';
import { useSetProject } from '@/workspace/hooks';

import { projectAutocomplete } from '../common/autocompletes';

interface ProjectFieldProps {
  previewMode?: boolean;
  hideLabel?: boolean;
  offering?: Offering;
  /**
   * Whether picking a project also switches the workspace to it. True for the
   * deploy wizard, where the choice is already committed to. Set false in a
   * dialog the user can still cancel, so a cancelled request does not leave
   * the whole workspace pointing somewhere else.
   */
  setCurrentProjectOnChange?: boolean;
}

export const ProjectField: FC<ProjectFieldProps> = ({
  previewMode,
  offering,
  setCurrentProjectOnChange = true,
}) => {
  const setCurrentProject = useSetProject();
  const { customer } = useOrderFormData();

  const loadOptions = useMemo(() => {
    const extra: ProjectsListData['query'] = {
      // UUID is used in suggest name API request
      field: ['name', 'url', 'uuid', 'end_date'],
    };
    const roles = offering ? getOfferingRestrictedRoles(offering) : [];
    if (roles.length) {
      // For a restricted offering, only show projects where the user holds one
      // of the required roles.
      extra.current_user_has_role = roles;
    }
    return projectAutocomplete(customer?.uuid, extra);
  }, [customer?.uuid, offering]);

  const onChange = useCallback(
    (value) => {
      if (setCurrentProjectOnChange) {
        setCurrentProject(value);
      }
    },
    [setCurrentProject, setCurrentProjectOnChange],
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
            customer={customer as any}
            title={translate('Add project')}
            variant="link"
            className="mb-1"
          />
        )
      }
    />
  );
};
