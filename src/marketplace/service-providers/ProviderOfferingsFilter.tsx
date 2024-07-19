import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { getInitialValues } from '@waldur/core/filters';
import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OfferingTypeAutocomplete } from '@waldur/marketplace/offerings/details/OfferingTypeAutocomplete';
import {
  OfferingStateFilter,
  getStates,
} from '@waldur/marketplace/offerings/list/OfferingStateFilter';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { PROVIDER_OFFERINGS_FORM_ID } from './constants';

const getFiltersFromParams = (params) => {
  if (!params?.state) return params;
  return {
    ...params,
    state: getStates().filter((state) => params.state.includes(state.value)),
  };
};

const PureProviderOfferingsFilter: FunctionComponent = () => (
  <>
    <TableFilterItem title={translate('State')} name="state">
      <OfferingStateFilter />
    </TableFilterItem>

    <TableFilterItem title={translate('Integration type')} name="offering_type">
      <OfferingTypeAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
    </TableFilterItem>
  </>
);

const enhance = reduxForm({
  form: PROVIDER_OFFERINGS_FORM_ID,
  initialValues: getFiltersFromParams(getInitialValues()),
  destroyOnUnmount: false,
});

export const ProviderOfferingsFilter = enhance(PureProviderOfferingsFilter);
