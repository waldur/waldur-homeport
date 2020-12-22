import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { BookingExtraComponent } from '@waldur/booking/BookingCheckoutSummary';

const marketplaceOfferingFormValuesSelector = getFormValues(
  'marketplaceOffering',
);

export const ShoppingCartItemUpdateExtraComponent: FunctionComponent = () => {
  const marketplaceOfferingForm = useSelector(
    marketplaceOfferingFormValuesSelector,
  );
  return <BookingExtraComponent formData={marketplaceOfferingForm} />;
};
