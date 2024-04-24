import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { PUBLIC_OFFERINGS_FILTER_FORM_ID } from '@waldur/marketplace/offerings/store/constants';
import { getCustomer } from '@waldur/workspace/selectors';

import { OfferingsFilter as MyOfferingsFilter } from './OfferingsFilter';
import { BaseOfferingsList } from './OfferingsList';

const mapStateToFilter = createSelector(
  getCustomer,
  getFormValues(PUBLIC_OFFERINGS_FILTER_FORM_ID),
  (customer, filterValues: any) => {
    const filter: Record<string, string | boolean> = {
      billable: false,
    };
    if (customer) {
      filter.customer_uuid = customer.uuid;
    }
    if (filterValues) {
      if (filterValues.state) {
        filter.state = filterValues.state.map((option) => option.value);
      }
    }
    return filter;
  },
);

export const MyOfferingsList = () => {
  const filter = useSelector(mapStateToFilter);
  return (
    <BaseOfferingsList
      table="marketplace-my-offerings"
      filter={filter}
      showActions={false}
      filters={<MyOfferingsFilter />}
    />
  );
};
