// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import { InvoiceStateEnum, InvoicesListData } from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const InvoiceStateEnumChoices: InvoiceStateEnumChoicesOption[] = [
  {
    label: translate('Canceled'),
    value: 'canceled',
  },
  {
    label: translate('Created'),
    value: 'created',
  },
  {
    label: translate('Paid'),
    value: 'paid',
  },
  {
    label: translate('Pending'),
    value: 'pending',
  },
  {
    label: translate('Pending finalization'),
    value: 'pending_finalization',
  },
];
export interface InvoiceStateEnumChoicesOption {
  label: string;
  value: InvoiceStateEnum;
}

const PureInvoicesFilter: FunctionComponent<{}> = () => (
  <TableFilterItem
    title={translate('State')}
    name="state"
    getValueLabel={(value: InvoiceStateEnumChoicesOption[]) =>
      value?.map((v) => v?.label).join(', ')
    }
  >
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('State')}
          options={InvoiceStateEnumChoices}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          getOptionValue={(option: InvoiceStateEnumChoicesOption) =>
            String(option.value)
          }
          getOptionLabel={(option: InvoiceStateEnumChoicesOption) =>
            option.label
          }
          isClearable={true}
          isMulti={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const InvoicesFilterFormId = 'InvoicesFilter';

interface InvoicesFilterFormData {
  state: InvoiceStateEnumChoicesOption[];
}

export const InvoicesFilter = reduxForm<InvoicesFilterFormData, {}>({
  form: InvoicesFilterFormId,
  destroyOnUnmount: false,
})(PureInvoicesFilter);

type InvoicesFilterQuery = InvoicesListData['query'];

export const selectInvoicesFilter = createSelector<
  RootState,
  Partial<InvoicesFilterFormData>,
  InvoicesFilterQuery
>(getFormValues(InvoicesFilterFormId), (values) => {
  const filter: InvoicesFilterQuery = {} as any;
  if (values) {
    if (values.state) {
      filter.state = values.state.map((v: any) => v.value);
    }
  }
  return filter;
});
