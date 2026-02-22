// This file is auto-generated. Do not edit manually.

/* eslint-disable @typescript-eslint/no-unused-vars */

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  MarketplaceProjectUpdateRequestsListData,
  RemoteProjectUpdateRequestStateEnum,
} from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const RemoteProjectUpdateRequestStateEnumChoices: RemoteProjectUpdateRequestStateEnumChoicesOption[] =
  [
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
export interface RemoteProjectUpdateRequestStateEnumChoicesOption {
  label: string;
  value: RemoteProjectUpdateRequestStateEnum;
}

export const PureProjectUpdateRequestListFilter: FunctionComponent<{}> = (
  _props,
) => (
  <TableFilterItem
    title={translate('State')}
    name="state"
    getValueLabel={(
      value: RemoteProjectUpdateRequestStateEnumChoicesOption[],
    ) => value?.map((v) => v?.label).join(', ')}
  >
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('State')}
          options={RemoteProjectUpdateRequestStateEnumChoices}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          getOptionValue={(
            option: RemoteProjectUpdateRequestStateEnumChoicesOption,
          ) => String(option.value)}
          getOptionLabel={(
            option: RemoteProjectUpdateRequestStateEnumChoicesOption,
          ) => option.label}
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
  state: RemoteProjectUpdateRequestStateEnumChoicesOption[];
}

export const ProjectUpdateRequestListFilter = reduxForm<
  ProjectUpdateRequestListFilterFormData,
  {}
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
        filter.state = values.state.map((v: any) => v.value);
      }
    }
    return filter;
  },
);
