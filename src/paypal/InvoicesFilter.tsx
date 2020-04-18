import * as React from 'react';
import { Field, reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { ToogleButtonFilter } from '@waldur/table-react/ToggleButtonFilter';

const PureInvoicesFilter = () => {
  const choices = React.useMemo(
    () => [
      {
        label: translate('Draft'),
        value: 'DRAFT',
      },
      {
        label: translate('Sent'),
        value: 'SENT',
      },
      {
        label: translate('Paid'),
        value: 'PAID',
      },
      {
        label: translate('Unpaid'),
        value: 'UNPAID',
      },
      {
        label: translate('Payment pending'),
        value: 'PAYMENT_PENDING',
      },
      {
        label: translate('Cancelled'),
        value: 'CANCELLED',
      },
    ],
    [],
  );

  return (
    <Field
      name="state"
      normalize={value => (Array.isArray(value) ? value.filter(x => x) : value)}
      component={props => (
        <ToogleButtonFilter choices={choices} {...props.input} />
      )}
    />
  );
};

const enhance = reduxForm({
  form: 'PayPalInvoicesFilter',
});

export const InvoicesFilter = enhance(PureInvoicesFilter);
