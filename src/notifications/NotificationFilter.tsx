import { FunctionComponent } from 'react';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';

import {
  getInitialValues,
  syncFiltersToURL,
  useReinitializeFilterFromUrl,
} from '@waldur/core/filters';
import { SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const PureNotificationFilter: FunctionComponent<any> = ({ form }) => {
  useReinitializeFilterFromUrl(form);
  return (
    <>
      <TableFilterItem name="is_overridden" title={translate('Status')}>
        <Field
          name="is_overridden"
          component={(fieldProps) => (
            <SelectField
              {...fieldProps}
              placeholder={translate('Select status')}
              options={[
                {
                  label: translate('Not overridden'),
                  value: false,
                },
                {
                  label: translate('Overridden'),
                  value: true,
                },
              ]}
              noUpdateOnBlur={true}
              simpleValue={true}
              isClearable={true}
            />
          )}
        ></Field>
      </TableFilterItem>
    </>
  );
};

const enhance = compose(
  reduxForm({
    form: 'notificationFilter',
    onChange: syncFiltersToURL,
    destroyOnUnmount: true,
    initialValues: getInitialValues(),
    enableReinitialize: true,
  }),
);

export const NotificationFilter = enhance(PureNotificationFilter);
