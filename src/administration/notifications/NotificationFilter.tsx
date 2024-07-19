import { FunctionComponent } from 'react';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';

import {
  getInitialValues,
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

const enhance = compose(
  reduxForm({
    form: 'notificationFilter',
    onChange: syncFiltersToURL,
    destroyOnUnmount: false,
    initialValues: getInitialValues(),
    enableReinitialize: true,
  }),
);

export const NotificationFilter = enhance(PureNotificationFilter);
