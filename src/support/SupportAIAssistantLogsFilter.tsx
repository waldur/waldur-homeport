import { FunctionComponent } from 'react';
import { Field, reduxForm } from 'redux-form';

import { DateField } from '@waldur/form/DateField';
import { SelectField } from '@waldur/form/SelectField';
import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { UserAutocomplete } from '@waldur/issues/feedback/UserAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const ARCHIVED_OPTIONS = [
  { value: true, label: translate('Yes') },
  { value: false, label: translate('No') },
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
      title={translate('Archived')}
      name="is_archived"
      badgeValue={(value) => value?.label}
    >
      <Field
        name="is_archived"
        component={SelectField}
        options={ARCHIVED_OPTIONS}
        isClearable
        {...REACT_SELECT_TABLE_FILTER}
        styles={{
          menuList: (baseStyles) => ({
            ...baseStyles,
            maxHeight: '120px',
          }),
        }}
      />
    </TableFilterItem>
  </>
);

const enhance = reduxForm({
  form: 'SupportAIAssistantLogsFilter',
  destroyOnUnmount: false,
});

export const SupportAIAssistantLogsFilter = enhance(PureAIAssistantLogsFilter);
