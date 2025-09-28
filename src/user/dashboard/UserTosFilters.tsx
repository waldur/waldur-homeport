import { Field, reduxForm } from 'redux-form';

import { SelectField } from '@waldur/form/SelectField';
import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';
import { USER_TOS_FILTER_FORM_ID } from '@waldur/user/constants';

const consentOptions = [
  { value: undefined, label: translate('All') },
  { value: true, label: translate('Accepted') },
  { value: false, label: translate('Not accepted') },
];

const PureUserTosFilters = () => (
  <TableFilterItem
    name="user_has_consent"
    title={translate('Consent status')}
    getValueLabel={(value) =>
      consentOptions.find((op) => op.value === value)?.label
    }
    instantApply={false}
  >
    <Field
      name="user_has_consent"
      component={(fieldProps) => (
        <SelectField
          {...fieldProps}
          placeholder={translate('Select status')}
          options={consentOptions}
          noUpdateOnBlur={true}
          simpleValue={true}
          isClearable={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const UserTosFilters = reduxForm({
  form: USER_TOS_FILTER_FORM_ID,
  destroyOnUnmount: false,
})(PureUserTosFilters);
