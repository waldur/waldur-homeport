import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { formValueSelector, Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormGroup, SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { type RootState } from '@waldur/store/reducers';

import { GROUP_INVITATION_CREATE_FORM_ID } from './constants';

export const ProjectGroup: FunctionComponent<{
  customer;
  loading?;
  disabled;
  required?;
}> = ({ customer, loading, disabled, required: isRequired = true }) => {
  const role = useSelector((state: RootState) =>
    formValueSelector(GROUP_INVITATION_CREATE_FORM_ID)(state, 'role'),
  );
  const projectEnabled = role?.content_type === 'project';
  if (!projectEnabled) {
    return null;
  }

  return (
    <Field
      name="project"
      component={FormGroup}
      label={translate('Project')}
      required={isRequired}
      validate={isRequired ? [required] : undefined}
      options={customer.projects}
      isDisabled={disabled}
      isLoading={loading}
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) => option.name}
      isClearable={true}
      space={5}
    >
      <SelectField />
    </Field>
  );
};
