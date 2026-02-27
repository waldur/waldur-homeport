// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  CallReviewerPoolsListData,
  InvitationStatusEnum,
} from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const InvitationStatusOptions: InvitationStatusOption[] = [
  {
    label: translate('Accepted'),
    value: 'accepted',
  },
  {
    label: translate('Declined'),
    value: 'declined',
  },
  {
    label: translate('Expired'),
    value: 'expired',
  },
  {
    label: translate('Pending'),
    value: 'pending',
  },
];
export interface InvitationStatusOption {
  label: string;
  value: InvitationStatusEnum;
}

const PureCallReviewerPoolsFilter: FunctionComponent<{}> = () => (
  <TableFilterItem
    title={translate('Status')}
    name="invitation_status"
    getValueLabel={(value: InvitationStatusOption) => value?.label}
  >
    <Field
      name="invitation_status"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Status')}
          options={InvitationStatusOptions}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          getOptionValue={(option: InvitationStatusOption) =>
            String(option.value)
          }
          getOptionLabel={(option: InvitationStatusOption) => option.label}
          isClearable={true}
          isMulti={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const CallReviewerPoolsFilterFormId = 'CallReviewerPoolsFilter';

interface CallReviewerPoolsFilterFormData {
  invitation_status: InvitationStatusOption[];
}

export const CallReviewerPoolsFilter = reduxForm<
  CallReviewerPoolsFilterFormData,
  {}
>({
  form: CallReviewerPoolsFilterFormId,
  destroyOnUnmount: false,
})(PureCallReviewerPoolsFilter);

type CallReviewerPoolsFilterQuery = CallReviewerPoolsListData['query'];

export const selectCallReviewerPoolsFilter = createSelector<
  RootState,
  Partial<CallReviewerPoolsFilterFormData>,
  CallReviewerPoolsFilterQuery
>(getFormValues(CallReviewerPoolsFilterFormId), (values) => {
  const filter: CallReviewerPoolsFilterQuery = {} as any;
  if (values) {
    if (values.invitation_status) {
      filter.invitation_status = values.invitation_status.map(
        (v: any) => v.value,
      );
    }
  }
  return filter;
});
