import { FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Field } from 'redux-form';

import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { ProjectCreateButton } from '@waldur/project/ProjectCreateButton';
import { setCurrentProject } from '@waldur/workspace/actions';

import { projectAutocomplete } from '../common/autocompletes';
import { FormGroup } from '../offerings/FormGroup';

import { orderCustomerSelector } from './utils';

interface ProjectFieldProps {
  previewMode?: boolean;
  hideLabel?: boolean;
}

export const ProjectField: FC<ProjectFieldProps> = ({
  previewMode,
  hideLabel,
}) => {
  const dispatch = useDispatch();
  const customer = useSelector(orderCustomerSelector);
  if (!customer) {
    return translate('Please select organization first.');
  }
  return (
    <FormGroup
      label={hideLabel ? undefined : translate('Project')}
      required={true}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flexGrow: 1, marginRight: 10 }}>
          <Field
            name="project"
            component={(fieldProps) => (
              <AsyncPaginate
                placeholder={translate('Select project...')}
                noOptionsMessage={() => translate('No projects found')}
                loadOptions={(query, prevOptions, { page }) =>
                  projectAutocomplete(customer.uuid, query, prevOptions, page, {
                    // UUID is used in suggest name API request
                    field: ['name', 'url', 'uuid'],
                  })
                }
                label={translate('Project')}
                value={fieldProps.input.value}
                onChange={(value) => {
                  fieldProps.input.onChange(value);
                  dispatch(setCurrentProject(value));
                }}
                getOptionValue={(option) => option.url}
                getOptionLabel={(option) => option.name}
                isClearable={false}
              />
            )}
          />
        </div>
        {!previewMode && <ProjectCreateButton />}
      </div>
    </FormGroup>
  );
};
