import { FC, useCallback, useMemo } from 'react';
import { Field } from 'react-final-form';
import { useDispatch } from 'react-redux';

import { required } from '@/core/validators';
import { AsyncSelect } from '@/form/select';
import { translate } from '@/i18n';
import { useOrderFormData } from '@/marketplace/deploy/selectors';
import { ProjectCreateButton } from '@/project/create/ProjectCreateButton';
import { setCurrentProject } from '@/workspace/actions';

import { projectAutocomplete } from '../common/autocompletes';
import { FormGroup } from '../offerings/FormGroup';

const ProjectSelect = ({ input }) => {
  const dispatch = useDispatch();
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
      input.onChange(value);
      dispatch(setCurrentProject(value));
    },
    [dispatch, input],
  );

  return (
    <AsyncSelect
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
    />
  );
};

interface ProjectFieldProps {
  previewMode?: boolean;
  hideLabel?: boolean;
}

export const ProjectField: FC<ProjectFieldProps> = ({ previewMode }) => {
  const { customer } = useOrderFormData();

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
