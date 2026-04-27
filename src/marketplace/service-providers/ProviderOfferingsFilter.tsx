import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { getInitialValues } from '@/core/filters';
import { REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { OfferingTypeAutocomplete } from '@/marketplace/offerings/details/OfferingTypeAutocomplete';
import {
  OfferingStateFilter,
  getStates,
} from '@/marketplace/offerings/list/OfferingStateFilter';
import { TagFilter } from '@/marketplace/tags/TagFilter';
import { TableFilterItem } from '@/table/TableFilterItem';

import { PROVIDER_OFFERINGS_FORM_ID } from './constants';

const getFiltersFromParams = (params) => {
  if (!params?.state) {
    return {
      ...params,
      state: getStates().filter((state) => state.value !== 'Archived'),
    };
  }
  return {
    ...params,
    state: getStates().filter((state) => params.state.includes(state.value)),
  };
};

const PureProviderOfferingsFilter: FunctionComponent = () => (
  <>
    <TableFilterItem
      title={translate('State')}
      name="state"
      instantApply={false}
    >
      <OfferingStateFilter />
    </TableFilterItem>

    <TableFilterItem title={translate('Integration type')} name="offering_type">
      <OfferingTypeAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
    </TableFilterItem>

    <TableFilterItem
      title={translate('Tag')}
      name="tag"
      badgeValue={(value) => value?.name}
    >
      <TagFilter />
    </TableFilterItem>
  </>
);

const enhance = reduxForm({
  form: PROVIDER_OFFERINGS_FORM_ID,
  initialValues: getFiltersFromParams(getInitialValues()),
  destroyOnUnmount: false,
});

export const ProviderOfferingsFilter = enhance(PureProviderOfferingsFilter);
