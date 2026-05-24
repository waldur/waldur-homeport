// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import {
  CallReviewerPoolsListData,
  InvitationStatusEnum,
} from 'waldur-js-client';

import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

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

export const CallReviewerPoolsFilter: FunctionComponent<{}> = () => (
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
          variant="tableFilter"
        />
      )}
    />
  </TableFilterItem>
);

export const CallReviewerPoolsFilterFormId = 'CallReviewerPoolsFilter';

export interface CallReviewerPoolsFilterFormData {
  invitation_status: InvitationStatusOption[];
}

type CallReviewerPoolsFilterQuery = CallReviewerPoolsListData['query'];

export const selectCallReviewerPoolsFilter = (
  values?: Partial<CallReviewerPoolsFilterFormData>,
): CallReviewerPoolsFilterQuery => {
  const filter: CallReviewerPoolsFilterQuery = {} as any;
  if (values) {
    if (values.invitation_status) {
      filter.invitation_status = values.invitation_status.map(
        (v: any) => v.value,
      );
    }
  }
  return filter;
};
