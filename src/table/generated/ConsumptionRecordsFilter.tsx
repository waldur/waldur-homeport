// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  AdminArrowConsumptionRecordsListData,
  Customer,
  customersList,
} from 'waldur-js-client';

import {
  Select,
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { createSelectFetcher } from '@waldur/table/api';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const IsFinalizedChoices: IsFinalizedChoicesOption[] = [
  {
    label: translate('Pending'),
    value: false,
  },
  {
    label: translate('Finalized'),
    value: true,
  },
];
export interface IsFinalizedChoicesOption {
  label: string;
  value: boolean;
}

export const PureConsumptionRecordsFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem
      title={translate('Organization')}
      name="organization"
      getValueLabel={(value: Customer) => value?.name}
    >
      <Field
        name="organization"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Organization')}
            loadOptions={createSelectFetcher(customersList, 'query')}
            defaultOptions
            getOptionValue={(option: Customer) => String(option.uuid || '')}
            getOptionLabel={(option: Customer) => String(option.name || '')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
            className="metronic-select-container"
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Status')}
      name="is_finalized"
      getValueLabel={(value: IsFinalizedChoicesOption) => value?.label}
    >
      <Field
        name="is_finalized"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Status')}
            options={IsFinalizedChoices}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: IsFinalizedChoicesOption) =>
              String(option.value)
            }
            getOptionLabel={(option: IsFinalizedChoicesOption) => option.label}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
  </>
);

export const ConsumptionRecordsFilterFormId = 'ConsumptionRecordsFilter';

interface ConsumptionRecordsFilterFormData {
  organization: Customer;
  is_finalized: IsFinalizedChoicesOption;
}

export const ConsumptionRecordsFilter = reduxForm<
  ConsumptionRecordsFilterFormData,
  {}
>({
  form: ConsumptionRecordsFilterFormId,
  destroyOnUnmount: false,
})(PureConsumptionRecordsFilter);

export const selectConsumptionRecordsFilter = createSelector(
  getFormValues(ConsumptionRecordsFilterFormId),
  (values: ConsumptionRecordsFilterFormData | undefined) => {
    const filter: AdminArrowConsumptionRecordsListData['query'] = {};
    if (values) {
      if (values.organization) {
        filter.customer_uuid = values.organization.uuid;
      }
      if (values.is_finalized) {
        filter.is_finalized = values.is_finalized.value;
      }
    }
    return filter;
  },
);
