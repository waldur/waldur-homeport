// This file is auto-generated. Do not edit manually.

/* eslint-disable @typescript-eslint/no-unused-vars */

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import { AdminArrowBillingSyncsListData } from 'waldur-js-client';

import { StringField } from '@waldur/form';
import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const StateChoices: StateChoicesOption[] = [
  {
    label: translate('Pending'),
    value: 1,
  },
  {
    label: translate('Syncing'),
    value: 2,
  },
  {
    label: translate('Synced'),
    value: 3,
  },
  {
    label: translate('Failed'),
    value: 4,
  },
];
export interface StateChoicesOption {
  label: string;
  value: number;
}

export const PureBillingSyncFilter: FunctionComponent<{}> = (_props) => (
  <>
    <TableFilterItem
      title={translate('State')}
      name="state"
      getValueLabel={(value: StateChoicesOption) => value?.label}
    >
      <Field
        name="state"
        component={(fieldProps) => (
          <Select
            placeholder={translate('State')}
            options={StateChoices}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: StateChoicesOption) =>
              String(option.value)
            }
            getOptionLabel={(option: StateChoicesOption) => option.label}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('Period from')} name="report_period_from">
      <Field
        name="report_period_from"
        component={StringField}
        placeholder={translate('Period from')}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('Period to')} name="report_period_to">
      <Field
        name="report_period_to"
        component={StringField}
        placeholder={translate('Period to')}
      />
    </TableFilterItem>
  </>
);

export const BillingSyncFilterFormId = 'BillingSyncFilter';

interface BillingSyncFilterFormData {
  state: StateChoicesOption;
  report_period_from: string;
  report_period_to: string;
}

export const BillingSyncFilter = reduxForm<BillingSyncFilterFormData, {}>({
  form: BillingSyncFilterFormId,
  destroyOnUnmount: false,
})(PureBillingSyncFilter);

export const selectBillingSyncFilter = createSelector(
  getFormValues(BillingSyncFilterFormId),
  (values: BillingSyncFilterFormData | undefined) => {
    const filter: AdminArrowBillingSyncsListData['query'] = {};
    if (values) {
      if (values.state) {
        filter.state = values.state.value;
      }
      if (values.report_period_from) {
        filter.report_period_from = values.report_period_from;
      }
      if (values.report_period_to) {
        filter.report_period_to = values.report_period_to;
      }
    }
    return filter;
  },
);
