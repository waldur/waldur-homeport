import { FunctionComponent } from 'react';
import { Field, reduxForm } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import { AsyncPaginate, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { getPublicCallOptions } from '@waldur/proposals/api';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { USER_PROPOSALS_FILTER_FORM_ID } from '../constants';

const states = [
  {
    label: translate('Draft'),
    value: 'Draft',
  },
  {
    label: translate('Submitted'),
    value: 'Submitted',
  },
  {
    label: translate('In review'),
    value: 'In review',
  },
  {
    label: translate('In revision'),
    value: 'In revision',
  },
  {
    label: translate('Accepted'),
    value: 'Accepted',
  },
  {
    label: translate('Rejected'),
    value: 'Rejected',
  },
  {
    label: translate('Cancelled'),
    value: 'Cancelled',
  },
];

const callsAutocomplete = async (query: string, prevOptions, { page }) => {
  const params = {
    name: query,
    field: ['name', 'uuid'],
    o: 'name',
    page: page,
    page_size: ENV.pageSize,
  };
  const response = await getPublicCallOptions(params);
  return returnReactSelectAsyncPaginateObject(response, prevOptions, page);
};

const PureProposalsTableFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem title={translate('State')} name="state">
      <Field
        name="state"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Select state...')}
            options={states}
            value={fieldProps.input.value}
            onChange={(item) => fieldProps.input.onChange(item)}
            isMulti={true}
            isClearable={true}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Call')}
      name="call"
      badgeValue={(value) => value?.name}
    >
      <Field
        name="call"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Select call...')}
            loadOptions={(query, prevOptions, { page }) =>
              callsAutocomplete(query, prevOptions, page)
            }
            getOptionValue={(option) => option.uuid}
            getOptionLabel={(option) => option.name}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            noOptionsMessage={() => translate('No calls')}
            isClearable={true}
          />
        )}
      />
    </TableFilterItem>
  </>
);

const enhance = reduxForm({
  form: USER_PROPOSALS_FILTER_FORM_ID,
  destroyOnUnmount: false,
});

export const ProposalsTableFilter = enhance(PureProposalsTableFilter);
