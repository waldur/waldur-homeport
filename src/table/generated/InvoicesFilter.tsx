// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import { InvoiceStateEnum, InvoicesListData } from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { RootState } from '@/store/reducers';
import { TableFilterItem } from '@/table/TableFilterItem';

export const InvoiceStateOptions: InvoiceStateOption[] = [
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
export interface InvoiceStateOption {
  label: string;
  value: InvoiceStateEnum;
}

const PureInvoicesFilter: FunctionComponent<{}> = () => (
  <TableFilterItem
    title={translate('State')}
    name="state"
    getValueLabel={(value: InvoiceStateOption) => value?.label}
  >
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('State')}
          options={InvoiceStateOptions}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          getOptionValue={(option: InvoiceStateOption) => String(option.value)}
          getOptionLabel={(option: InvoiceStateOption) => option.label}
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
  state: InvoiceStateOption[];
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
