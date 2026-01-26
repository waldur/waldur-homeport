import { FC, useCallback } from 'react';
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

const ProjectSelect = ({ input }) => {
  const dispatch = useDispatch();
  const customer = useSelector(orderCustomerSelector);

  const loadOptions = useCallback(
    (query, prevOptions, { page }) =>
      projectAutocomplete(customer.uuid, query, prevOptions, page, {
        // UUID is used in suggest name API request
        field: ['name', 'url', 'uuid', 'end_date'],
      }),
    [customer],
  );

  const onChange = useCallback(
    (value) => {
      input.onChange(value);
      dispatch(setCurrentProject(value));
    },
    [dispatch, input],
  );

  return (
    <AsyncPaginate
      placeholder={
        customer
          ? translate('Select project...')
          : translate('Please select organization first')
      }
      noOptionsMessage={() => translate('No projects found')}
      loadOptions={loadOptions}
      label={translate('Project')}
      value={input.value}
      onChange={onChange}
      getOptionValue={(option) => option.url}
      getOptionLabel={(option) => option.name}
      isClearable={false}
      isDisabled={!customer}
      className="metronic-select-container"
      classNamePrefix="metronic-select"
    />
  );
};

interface ProjectFieldProps {
  previewMode?: boolean;
  hideLabel?: boolean;
}

export const ProjectField: FC<ProjectFieldProps> = ({ previewMode }) => {
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
            className="mb-1"
          />
        )
      }
    >
      <Field name="project" validate={required} component={ProjectSelect} />
    </FormGroup>
  );
};
