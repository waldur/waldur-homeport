import { useSelector } from 'react-redux';
import { Field } from 'redux-form';

import { SelectField, FormGroup } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/workspace/selectors';

export const OrganizationProjectSelectField = () => {
  const currentCustomer = useSelector(getCustomer);

  return (
    <Field
      name="project"
      label={translate('Project')}
      component={FormGroup}
      required={true}
    >
      <SelectField
        options={currentCustomer?.projects}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.url}
        isClearable={false}
      />
    </Field>
  );
};
