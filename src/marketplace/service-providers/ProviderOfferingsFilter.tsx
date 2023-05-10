import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { getInitialValues } from '@waldur/core/filters';
import { translate } from '@waldur/i18n';
import {
  OfferingStateFilter,
  getStates,
} from '@waldur/marketplace/offerings/OfferingStateFilter';
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
  <TableFilterItem title={translate('State')} name="state">
    <OfferingStateFilter />
  </TableFilterItem>
);

const enhance = reduxForm({
  form: PROVIDER_OFFERINGS_FORM_ID,
  initialValues: getFiltersFromParams(getInitialValues()),
  destroyOnUnmount: false,
});

export const ProviderOfferingsFilter = enhance(PureProviderOfferingsFilter);
