import { Field, reduxForm } from 'redux-form';

import {
  syncFiltersToURL,
  useReinitializeFilterFromUrl,
} from '@waldur/core/filters';
import {
  AsyncPaginate,
  REACT_MULTI_SELECT_TABLE_FILTER,
  REACT_SELECT_TABLE_FILTER,
  Select,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { userAutocomplete } from '@waldur/marketplace/common/autocompletes';
import {
  CallFilterItem,
  OrganizationFilterItem,
  RoundFilterItem,
} from '@waldur/proposals/filters/CommonFilterItems';
import { getReviewStateOptions } from '@waldur/proposals/utils';
import { TableFilterItem } from '@waldur/table/TableFilterItem';
import { USER_REVIEWS_FILTER_FORM_ID } from '@waldur/user/constants';

const PureAdminReviewsTableFilter = ({ form }) => {
  useReinitializeFilterFromUrl(form);
  return (
    <>
      <TableFilterItem
        title={translate('State')}
        name="state"
        instantApply={false}
      >
        <Field
          name="state"
          component={(fieldProps) => (
            <Select
              placeholder={translate('Select state...')}
              options={getReviewStateOptions()}
              value={fieldProps.input.value}
              onChange={(item) => fieldProps.input.onChange(item)}
              isClearable={true}
              {...REACT_MULTI_SELECT_TABLE_FILTER}
            />
          )}
        />
      </TableFilterItem>
      <CallFilterItem />
      <RoundFilterItem />
      <OrganizationFilterItem />
      <TableFilterItem
        title={translate('Reviewer')}
        name="reviewer"
        badgeValue={(value) => value?.full_name || value?.email}
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
              isClearable={true}
              {...REACT_SELECT_TABLE_FILTER}
            />
          )}
        />
      </TableFilterItem>
    </>
  );
};

const enhance = reduxForm({
  form: USER_REVIEWS_FILTER_FORM_ID,
  destroyOnUnmount: false,
  onChange: syncFiltersToURL,
});

export const AdminReviewsTableFilter = enhance(PureAdminReviewsTableFilter);
