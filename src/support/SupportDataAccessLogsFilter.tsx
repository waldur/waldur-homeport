import { Field, reduxForm } from 'redux-form';

import { DateField } from '@waldur/form/DateField';
import { SelectField } from '@waldur/form/SelectField';
import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { UserAutocomplete } from '@waldur/issues/feedback/UserAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const ACCESSOR_TYPE_OPTIONS = [
  { value: 'staff', label: translate('Staff') },
  { value: 'support', label: translate('Support') },
  { value: 'organization_member', label: translate('Organization member') },
  { value: 'service_provider', label: translate('Service provider') },
  { value: 'self', label: translate('Self-access') },
];

const PureSupportDataAccessLogsFilter = () => (
  <>
    <TableFilterItem
      title={translate('Start date')}
      name="start_date"
      badgeValue={(value) => value}
    >
      <Field
        name="start_date"
        component={DateField}
        placeholder="YYYY-MM-DD"
        inline
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('End date')}
      name="end_date"
      badgeValue={(value) => value}
    >
      <Field
        name="end_date"
        component={DateField}
        placeholder="YYYY-MM-DD"
        inline
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Accessor type')}
      name="accessor_type"
      badgeValue={(value) => value?.label}
    >
      <Field
        name="accessor_type"
        component={SelectField}
        options={ACCESSOR_TYPE_OPTIONS}
        isClearable
        {...REACT_SELECT_TABLE_FILTER}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('User')}
      name="user"
      badgeValue={(value) => value?.full_name}
    >
      <UserAutocomplete />
    </TableFilterItem>
  </>
);

const enhance = reduxForm({
  form: 'SupportDataAccessLogsFilter',
  destroyOnUnmount: false,
});

export const SupportDataAccessLogsFilter = enhance(
  PureSupportDataAccessLogsFilter,
);
