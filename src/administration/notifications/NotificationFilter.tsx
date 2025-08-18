import { FunctionComponent } from 'react';
import { Field, reduxForm } from 'redux-form';

import {
  syncFiltersToURL,
  useReinitializeFilterFromUrl,
} from '@waldur/core/filters';
import { SelectField } from '@waldur/form';
import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const options = [
  {
    label: translate('Not overridden'),
    value: false,
  },
  {
    label: translate('Overridden'),
    value: true,
  },
];

const PureNotificationFilter: FunctionComponent<{ form }> = ({ form }) => {
  useReinitializeFilterFromUrl(form);
  return (
    <TableFilterItem
      name="is_overridden"
      title={translate('Status')}
      getValueLabel={(value) => options.find((op) => op.value === value).label}
    >
      <Field
        name="is_overridden"
        component={(fieldProps) => (
          <SelectField
            {...fieldProps}
            placeholder={translate('Select status')}
            options={options}
            noUpdateOnBlur={true}
            simpleValue={true}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
  );
};

export const NotificationFilter = reduxForm({
  form: 'notificationFilter',
  onChange: syncFiltersToURL,
  destroyOnUnmount: false,
})(PureNotificationFilter);
