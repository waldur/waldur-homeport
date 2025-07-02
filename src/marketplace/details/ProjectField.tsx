import { FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { ProjectCreateButton } from '@waldur/project/create/ProjectCreateButton';
import { setCurrentProject } from '@waldur/workspace/actions';

import { projectAutocomplete } from '../common/autocompletes';
import { orderCustomerSelector } from '../deploy/selectors';
import { FormGroup } from '../offerings/FormGroup';

interface ProjectFieldProps {
  previewMode?: boolean;
  hideLabel?: boolean;
}

export const ProjectField: FC<ProjectFieldProps> = ({ previewMode }) => {
  const dispatch = useDispatch();
  const customer = useSelector(orderCustomerSelector);

  return (
    <FormGroup
      label={translate('Project')}
      required={true}
      spaceless
      quickAction={
        !previewMode && (
          <ProjectCreateButton
            customer={customer}
            title={translate('Add project')}
            variant="link"
            size="sm"
            className="btn-text-primary btn-icon-primary mb-1"
          />
        )
      }
    >
      <Field
        name="project"
        validate={required}
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={
              customer
                ? translate('Select project...')
                : translate('Please select organization first')
            }
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
            isDisabled={!customer}
            className="metronic-select-container"
            classNamePrefix="metronic-select"
          />
        )}
      />
    </FormGroup>
  );
};
