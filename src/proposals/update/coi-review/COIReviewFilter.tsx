import { FC } from 'react';
import { Field, reduxForm } from 'redux-form';
import { proposalProtectedCallsRoundsList } from 'waldur-js-client';

import { parseSelectData } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import { AsyncPaginate, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { Call } from '@waldur/proposals/types';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const COI_STATUS_OPTIONS = [
  { value: 'pending', label: translate('Pending') },
  { value: 'confirmed', label: translate('Confirmed') },
  { value: 'dismissed', label: translate('Dismissed') },
  { value: 'waived', label: translate('Waived') },
  { value: 'recused', label: translate('Recused') },
];

const COI_SEVERITY_OPTIONS = [
  { value: 'real', label: translate('Real') },
  { value: 'apparent', label: translate('Apparent') },
  { value: 'potential', label: translate('Potential') },
];

const COI_TYPE_OPTIONS = [
  { value: 'institutional', label: translate('Institutional') },
  { value: 'personal', label: translate('Personal') },
  { value: 'financial', label: translate('Financial') },
  { value: 'coauthorship', label: translate('Co-authorship') },
  { value: 'professional', label: translate('Professional') },
  { value: 'other', label: translate('Other') },
];

const DETECTION_METHOD_OPTIONS = [
  { value: 'manual', label: translate('Manual') },
  { value: 'self_declared', label: translate('Self-declared') },
  { value: 'automatic', label: translate('Automatic') },
];

export const COI_REVIEW_FILTER_FORM_ID = 'COIReviewFilter';

export const getCOIStatusOptions = () => COI_STATUS_OPTIONS;
export const getCOISeverityOptions = () => COI_SEVERITY_OPTIONS;
export const getCOITypeOptions = () => COI_TYPE_OPTIONS;

const loadRounds = async (callUuid: string, _query, prevOptions, page) => {
  const response = await proposalProtectedCallsRoundsList({
    path: { uuid: callUuid },
    query: {
      page,
      page_size: ENV.pageSize,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    page,
  );
};

interface PureCOIReviewFilterProps {
  call: Call;
}

const PureCOIReviewFilter: FC<PureCOIReviewFilterProps> = ({ call }) => (
  <>
    <TableFilterItem title={translate('Round')} name="round">
      <Field
        name="round"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('All rounds')}
            loadOptions={(query, prevOptions, { page }) =>
              loadRounds(call.uuid, query, prevOptions, page)
            }
            defaultOptions
            getOptionValue={(option) => option.uuid}
            getOptionLabel={(option) => option.name}
            value={fieldProps.input.value}
            onChange={fieldProps.input.onChange}
            isClearable
            noOptionsMessage={() => translate('No rounds')}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('Status')} name="status">
      <Field
        name="status"
        component={(fieldProps) => (
          <Select
            placeholder={translate('All statuses')}
            options={COI_STATUS_OPTIONS}
            value={fieldProps.input.value}
            onChange={fieldProps.input.onChange}
            isClearable
            isMulti
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('Severity')} name="severity">
      <Field
        name="severity"
        component={(fieldProps) => (
          <Select
            placeholder={translate('All severities')}
            options={COI_SEVERITY_OPTIONS}
            value={fieldProps.input.value}
            onChange={fieldProps.input.onChange}
            isClearable
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('Type')} name="coi_type">
      <Field
        name="coi_type"
        component={(fieldProps) => (
          <Select
            placeholder={translate('All types')}
            options={COI_TYPE_OPTIONS}
            value={fieldProps.input.value}
            onChange={fieldProps.input.onChange}
            isClearable
            isMulti
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('Detection')} name="detection_method">
      <Field
        name="detection_method"
        component={(fieldProps) => (
          <Select
            placeholder={translate('All methods')}
            options={DETECTION_METHOD_OPTIONS}
            value={fieldProps.input.value}
            onChange={fieldProps.input.onChange}
            isClearable
            isMulti
          />
        )}
      />
    </TableFilterItem>
  </>
);

const enhance = reduxForm<{}, PureCOIReviewFilterProps>({
  form: COI_REVIEW_FILTER_FORM_ID,
  destroyOnUnmount: false,
});

export const COIReviewFilter = enhance(PureCOIReviewFilter);
