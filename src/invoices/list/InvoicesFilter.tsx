import { useMemo } from 'react';
import { Field, reduxForm } from 'redux-form';

import { ENV } from '@waldur/core/config';
import {
  REACT_MULTI_SELECT_TABLE_FILTER,
  Select,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const getInvoiceStatusOptions = (accountingMode?) => {
  const result = [
    {
      label: translate('Pending'),
      value: 'pending',
    },
    {
      label: translate('Canceled'),
      value: 'canceled',
    },
    {
      label: translate('Created'),
      value: 'created',
    },
  ];

  if (accountingMode !== 'accounting') {
    result.push({
      label: translate('Paid'),
      value: 'paid',
    });
  }

  return result;
};

const PureInvoicesFilter = () => {
  const choices = useMemo(() => {
    return getInvoiceStatusOptions(ENV.accountingMode);
  }, [ENV.accountingMode]);

  return (
    <TableFilterItem
      name="state"
      title={translate('State')}
      instantApply={false}
    >
      <Field
        name="state"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Select state...')}
            options={choices}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_MULTI_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
  );
};

const enhance = reduxForm({
  form: 'InvoicesFilter',
  destroyOnUnmount: false,
});

export const InvoicesFilter = enhance(PureInvoicesFilter);
