import { Field } from 'redux-form';
import { callRoundsList } from 'waldur-js-client';

import { parseSelectData } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import {
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { organizationAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { CallAutocomplete } from '../CallAutocomplete';

const roundAutocomplete = async (_query, prevOptions, page) => {
  const response = await callRoundsList({
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

export const CallFilterItem = () => (
  <TableFilterItem
    title={translate('Call')}
    name="call"
    badgeValue={(value) => value?.name}
  >
    <CallAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
  </TableFilterItem>
);

export const RoundFilterItem = () => (
  <TableFilterItem
    title={translate('Round')}
    name="round"
    badgeValue={(value) => value?.name}
  >
    <Field
      name="round"
      component={(fieldProps) => (
        <AsyncPaginate
          placeholder={translate('Select round...')}
          loadOptions={(query, prevOptions, { page }) =>
            roundAutocomplete(query, prevOptions, page)
          }
          defaultOptions
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.name}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          noOptionsMessage={() => translate('No rounds')}
          isClearable={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const OrganizationFilterItem = () => (
  <TableFilterItem
    title={translate('Organization')}
    name="organization"
    badgeValue={(value) => value?.name}
  >
    <Field
      name="organization"
      component={(fieldProps) => (
        <AsyncPaginate
          placeholder={translate('Select organization...')}
          loadOptions={(query, prevOptions, { page }) =>
            organizationAutocomplete(query, prevOptions, page, {
              field: ['name', 'uuid', 'abbreviation'],
              o: 'name',
            })
          }
          defaultOptions
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.name}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          noOptionsMessage={() => translate('No organizations')}
          isClearable={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);
