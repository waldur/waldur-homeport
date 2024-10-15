import { useSelector } from 'react-redux';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { SelectField, FormGroup } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/workspace/selectors';

export const OrganizationProjectSelectField = ({ disabled = false }) => {
  const currentCustomer = useSelector(getCustomer);

  return (
    <Field
      name="project"
      label={translate('Project')}
      component={FormGroup}
      validate={[required]}
      required
    >
      <SelectField
        options={currentCustomer?.projects}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.url}
        isClearable={false}
        isDisabled={disabled}
      />
    </Field>
  );
};
