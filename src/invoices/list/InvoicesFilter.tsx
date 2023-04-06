import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { getConfig } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const PureInvoicesFilter = () => {
  const accountingMode = useSelector(
    (state: RootState) => getConfig(state).accountingMode,
  );

  const choices = useMemo(() => {
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
  }, [accountingMode]);

  return (
    <>
      <TableFilterItem title={translate('State')}>
        <Field
          name="state"
          component={(fieldProps) => (
            <Select
              placeholder={translate('Select state...')}
              options={choices}
              value={fieldProps.input.value}
              onChange={(value) => fieldProps.input.onChange(value)}
              isMulti={true}
              isClearable={true}
            />
          )}
        />
      </TableFilterItem>
    </>
  );
};

const enhance = reduxForm({
  form: 'InvoicesFilter',
  destroyOnUnmount: false,
});

export const InvoicesFilter = enhance(PureInvoicesFilter);
