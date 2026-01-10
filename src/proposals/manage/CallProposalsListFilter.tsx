import { FC } from 'react';
import { Field, reduxForm } from 'redux-form';
import { proposalProtectedCallsRoundsList } from 'waldur-js-client';

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
import { getProposalStateOptions } from '@waldur/proposals/utils';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const CALL_PROPOSALS_FILTER_FORM_ID = 'CallProposalsListFilter';

interface CallProposalsListFilterProps {
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

const PureCallProposalsListFilter: FC<CallProposalsListFilterProps> = ({
  callUuid,
}) => {
  return (
    <>
      <TableFilterItem title={translate('Round')} name="round">
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
              options={getProposalStateOptions()}
              value={fieldProps.input.value}
              onChange={(item) => fieldProps.input.onChange(item)}
              isClearable
              isMulti
              {...REACT_MULTI_SELECT_TABLE_FILTER}
            />
          )}
        />
      </TableFilterItem>
      <TableFilterItem title={translate('Applicant')} name="applicant">
        <Field
          name="applicant"
          component={(fieldProps) => (
            <AsyncPaginate
              placeholder={translate('Select applicant...')}
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
    </>
  );
};

const enhance = reduxForm<{}, CallProposalsListFilterProps>({
  form: CALL_PROPOSALS_FILTER_FORM_ID,
  destroyOnUnmount: false,
});

export const CallProposalsListFilter = enhance(PureCallProposalsListFilter);
