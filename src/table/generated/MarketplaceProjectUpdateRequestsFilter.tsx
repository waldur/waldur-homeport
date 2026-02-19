// This file is auto-generated. Do not edit manually.

/* eslint-disable @typescript-eslint/no-unused-vars */

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import { MarketplaceProjectUpdateRequestsListData } from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const StateEnum_1 = [
  {
    label: translate('Approved'),
    value: 'approved',
  },
  {
    label: translate('Canceled'),
    value: 'canceled',
  },
  {
    label: translate('Draft'),
    value: 'draft',
  },
  {
    label: translate('Pending'),
    value: 'pending',
  },
  {
    label: translate('Rejected'),
    value: 'rejected',
  },
];
interface StateEnum_1Option {
  label: string;
  value: string;
}

export const PureProjectUpdateRequestListFilter: FunctionComponent<any> = (
  _props,
) => (
  <TableFilterItem
    title={translate('State')}
    name="state"
    getValueLabel={(value) => value?.label}
  >
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('State')}
          options={StateEnum_1}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          isClearable={true}
          isMulti={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const ProjectUpdateRequestListFilterFormId =
  'ProjectUpdateRequestListFilter';

interface ProjectUpdateRequestListFilterFormData {
  state: StateEnum_1Option[];
}

export const ProjectUpdateRequestListFilter = reduxForm<
  ProjectUpdateRequestListFilterFormData,
  any
>({
  form: ProjectUpdateRequestListFilterFormId,
  destroyOnUnmount: false,
})(PureProjectUpdateRequestListFilter);

export const selectProjectUpdateRequestListFilter = createSelector(
  getFormValues(ProjectUpdateRequestListFilterFormId),
  (values: ProjectUpdateRequestListFilterFormData | undefined) => {
    const filter: MarketplaceProjectUpdateRequestsListData['query'] = {};
    if (values) {
      if (values.state) {
        filter.state = values.state.map((v) => v.value) as any;
      }
    }
    return filter;
  },
);
