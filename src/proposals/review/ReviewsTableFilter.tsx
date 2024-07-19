import { Field, reduxForm } from 'redux-form';

import {
  syncFiltersToURL,
  useReinitializeFilterFromUrl,
} from '@waldur/core/filters';
import { REACT_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { CallAutocomplete } from '@waldur/proposals/CallAutocomplete';
import { getReviewStateOptions } from '@waldur/proposals/utils';
import { TableFilterItem } from '@waldur/table/TableFilterItem';
import { USER_REVIEWS_FILTER_FORM_ID } from '@waldur/user/constants';

const PureReviewsTableFilter = ({ form }) => {
  useReinitializeFilterFromUrl(form);
  return (
    <>
      <TableFilterItem title={translate('State')} name="state">
        <Field
          name="state"
          component={(fieldProps) => (
            <Select
              placeholder={translate('Select state...')}
              options={getReviewStateOptions()}
              value={fieldProps.input.value}
              onChange={(item) => fieldProps.input.onChange(item)}
              isMulti={true}
              isClearable={true}
              {...REACT_SELECT_TABLE_FILTER}
            />
          )}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Call')}
        name="call"
        badgeValue={(value) => value?.name}
      >
        <CallAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
      </TableFilterItem>
    </>
  );
};

const enhance = reduxForm({
  form: USER_REVIEWS_FILTER_FORM_ID,
  destroyOnUnmount: false,
  onChange: syncFiltersToURL,
});

export const ReviewsTableFilter = enhance(PureReviewsTableFilter);
