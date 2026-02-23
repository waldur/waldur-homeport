import { FunctionComponent } from 'react';
import { Field, reduxForm } from 'redux-form';

import { DateField } from '@waldur/form/DateField';
import { SelectField } from '@waldur/form/SelectField';
import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { UserAutocomplete } from '@waldur/issues/feedback/UserAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const YES_NO_OPTIONS = [
  { value: true, label: translate('Yes') },
  { value: false, label: translate('No') },
];

const SEVERITY_OPTIONS = [
  { value: 'critical', label: translate('Critical') },
  { value: 'high', label: translate('High') },
  { value: 'medium', label: translate('Medium') },
  { value: 'low', label: translate('Low') },
  { value: 'none', label: translate('None') },
];

const PureAIAssistantLogsFilter: FunctionComponent = () => (
  <>
    <TableFilterItem
      title={translate('Created')}
      name="created"
      badgeValue={(value) => value}
    >
      <Field
        name="created"
        component={DateField}
        placeholder="YYYY-MM-DD"
        inline
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Modified')}
      name="modified"
      badgeValue={(value) => value}
    >
      <Field
        name="modified"
        component={DateField}
        placeholder="YYYY-MM-DD"
        inline
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('User')}
      name="user"
      badgeValue={(value) => value?.full_name}
    >
      <UserAutocomplete />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Flagged messages')}
      name="is_flagged"
      badgeValue={(value) => value?.label}
    >
      <Field
        name="is_flagged"
        component={SelectField}
        options={YES_NO_OPTIONS}
        isClearable
        {...REACT_SELECT_TABLE_FILTER}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Max severity')}
      name="max_severity"
      badgeValue={(value) => value?.label}
    >
      <Field
        name="max_severity"
        component={SelectField}
        options={SEVERITY_OPTIONS}
        isClearable
        {...REACT_SELECT_TABLE_FILTER}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Archived')}
      name="is_archived"
      badgeValue={(value) => value?.label}
    >
      <Field
        name="is_archived"
        component={SelectField}
        options={YES_NO_OPTIONS}
        isClearable
        {...REACT_SELECT_TABLE_FILTER}
      />
    </TableFilterItem>
  </>
);

const enhance = reduxForm({
  form: 'SupportAIAssistantLogsFilter',
  destroyOnUnmount: false,
});

export const SupportAIAssistantLogsFilter = enhance(PureAIAssistantLogsFilter);
