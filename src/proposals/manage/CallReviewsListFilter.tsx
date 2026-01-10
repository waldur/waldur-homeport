import { FC } from 'react';
import { Field, reduxForm } from 'redux-form';
import {
  proposalProposalsList,
  proposalProtectedCallsRoundsList,
} from 'waldur-js-client';

import { parseSelectData } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import {
  AsyncPaginate,
  REACT_MULTI_SELECT_TABLE_FILTER,
  REACT_SELECT_TABLE_FILTER,
  Select,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { userAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { getReviewStateOptions } from '@waldur/proposals/utils';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const CALL_REVIEWS_FILTER_FORM_ID = 'CallReviewsListFilter';

interface CallReviewsListFilterProps {
  callUuid: string;
}

const roundAutocomplete = async (callUuid: string, prevOptions, page) => {
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

const proposalAutocomplete = async (
  callUuid: string,
  query: string,
  prevOptions,
  page,
) => {
  const response = await proposalProposalsList({
    query: {
      call_uuid: callUuid,
      name: query,
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

const PureCallReviewsListFilter: FC<CallReviewsListFilterProps> = ({
  callUuid,
}) => {
  return (
    <>
      <TableFilterItem
        title={translate('Round')}
        name="round"
        getValueLabel={(value) => value?.slug || value?.name}
      >
        <Field
          name="round"
          component={(fieldProps) => (
            <AsyncPaginate
              placeholder={translate('Select round...')}
              loadOptions={(_query, prevOptions, { page }) =>
                roundAutocomplete(callUuid, prevOptions, page)
              }
              defaultOptions
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) => option.slug}
              value={fieldProps.input.value}
              onChange={(value) => fieldProps.input.onChange(value)}
              noOptionsMessage={() => translate('No rounds')}
              isClearable
              {...REACT_SELECT_TABLE_FILTER}
            />
          )}
        />
      </TableFilterItem>
      <TableFilterItem title={translate('State')} name="state">
        <Field
          name="state"
          component={(fieldProps) => (
            <Select
              placeholder={translate('Select state...')}
              options={getReviewStateOptions()}
              value={fieldProps.input.value}
              onChange={(item) => fieldProps.input.onChange(item)}
              isClearable
              {...REACT_MULTI_SELECT_TABLE_FILTER}
            />
          )}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Reviewer')}
        name="reviewer"
        getValueLabel={(value) =>
          value?.full_name || value?.email || value?.username
        }
      >
        <Field
          name="reviewer"
          component={(fieldProps) => (
            <AsyncPaginate
              placeholder={translate('Select reviewer...')}
              loadOptions={userAutocomplete}
              defaultOptions
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) =>
                option.full_name || option.email || option.username
              }
              value={fieldProps.input.value}
              onChange={(value) => fieldProps.input.onChange(value)}
              noOptionsMessage={() => translate('No users')}
              isClearable
              {...REACT_SELECT_TABLE_FILTER}
            />
          )}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Proposal')}
        name="proposal"
        getValueLabel={(value) => value?.name}
      >
        <Field
          name="proposal"
          component={(fieldProps) => (
            <AsyncPaginate
              placeholder={translate('Select proposal...')}
              loadOptions={(query, prevOptions, { page }) =>
                proposalAutocomplete(callUuid, query, prevOptions, page)
              }
              defaultOptions
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) => option.name}
              value={fieldProps.input.value}
              onChange={(value) => fieldProps.input.onChange(value)}
              noOptionsMessage={() => translate('No proposals')}
              isClearable
              {...REACT_SELECT_TABLE_FILTER}
            />
          )}
        />
      </TableFilterItem>
    </>
  );
};

const enhance = reduxForm<{}, CallReviewsListFilterProps>({
  form: CALL_REVIEWS_FILTER_FORM_ID,
  destroyOnUnmount: false,
});

export const CallReviewsListFilter = enhance(PureCallReviewsListFilter);
