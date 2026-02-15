import { Field, reduxForm } from 'redux-form';

import { StringField } from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { SelectField } from '@waldur/form/SelectField';
import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const SOURCE_OPTIONS = [
  { value: 'api', label: translate('API') },
  { value: 'worker', label: translate('Worker') },
  { value: 'beat', label: translate('Beat') },
];

const LEVEL_OPTIONS = [
  { value: 'INFO', label: translate('Info') },
  { value: 'WARNING', label: translate('Warning') },
  { value: 'ERROR', label: translate('Error') },
  { value: 'CRITICAL', label: translate('Critical') },
];

const PureSupportSystemLogsFilter = () => (
  <>
    <TableFilterItem
      title={translate('Source')}
      name="source"
      badgeValue={(value) => value?.label}
    >
      <Field
        name="source"
        component={SelectField}
        options={SOURCE_OPTIONS}
        isClearable
        {...REACT_SELECT_TABLE_FILTER}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Level')}
      name="level"
      badgeValue={(value) => value?.label}
    >
      <Field
        name="level"
        component={SelectField}
        options={LEVEL_OPTIONS}
        isClearable
        {...REACT_SELECT_TABLE_FILTER}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Instance')}
      name="instance"
      instantApply={false}
    >
      <Field
        name="instance"
        component={StringField}
        placeholder={translate('Instance name')}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Logger name')}
      name="logger_name"
      instantApply={false}
    >
      <Field
        name="logger_name"
        component={StringField}
        placeholder={translate('Logger name')}
      />
    </TableFilterItem>
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
  </>
);

const enhance = reduxForm({
  form: 'SupportSystemLogsFilter',
  destroyOnUnmount: false,
});

export const SupportSystemLogsFilter = enhance(PureSupportSystemLogsFilter);
