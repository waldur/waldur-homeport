// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import { AdminArrowBillingSyncsListData } from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const StateOptions: StateOption[] = [
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
export interface StateOption {
  label: string;
  value: number;
}

const PureAdminArrowBillingSyncsFilter: FunctionComponent<
  AdminArrowBillingSyncsFilterProps
> = (props) => (
  <>
    <TableFilterItem
      title={translate('State')}
      name="state"
      getValueLabel={(value: StateOption) => value?.label}
    >
      <Field
        name="state"
        component={(fieldProps) => (
          <Select
            placeholder={translate('State')}
            options={StateOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: StateOption) => String(option.value)}
            getOptionLabel={(option: StateOption) => option.label}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Period from')}
      name="report_period_from"
      getValueLabel={(value: any) => value?.label}
    >
      <Field
        name="report_period_from"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Period from')}
            options={props.billingPeriods}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Period to')}
      name="report_period_to"
      getValueLabel={(value: any) => value?.label}
    >
      <Field
        name="report_period_to"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Period to')}
            options={props.billingPeriods}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
  </>
);

export const AdminArrowBillingSyncsFilterFormId =
  'AdminArrowBillingSyncsFilter';

interface AdminArrowBillingSyncsFilterProps {
  billingPeriods?: any[];
}

interface AdminArrowBillingSyncsFilterFormData {
  state: StateOption;
  report_period_from: any;
  report_period_to: any;
}

export const AdminArrowBillingSyncsFilter = reduxForm<
  AdminArrowBillingSyncsFilterFormData,
  AdminArrowBillingSyncsFilterProps
>({
  form: AdminArrowBillingSyncsFilterFormId,
  destroyOnUnmount: false,
})(PureAdminArrowBillingSyncsFilter);

type AdminArrowBillingSyncsFilterQuery =
  AdminArrowBillingSyncsListData['query'];

export const selectAdminArrowBillingSyncsFilter = createSelector<
  RootState,
  Partial<AdminArrowBillingSyncsFilterFormData>,
  AdminArrowBillingSyncsFilterQuery
>(getFormValues(AdminArrowBillingSyncsFilterFormId), (values) => {
  const filter: AdminArrowBillingSyncsFilterQuery = {} as any;
  if (values) {
    if (values.state) {
      filter.state = values.state.value;
    }
    if (values.report_period_from) {
      filter.report_period_from = values.report_period_from.value;
    }
    if (values.report_period_to) {
      filter.report_period_to = values.report_period_to.value;
    }
  }
  return filter;
});
