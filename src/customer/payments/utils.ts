import { PAYMENTS_TABLE } from '@waldur/customer/details/constants';
import { getActivePaymentProfile } from '@waldur/invoices/details/utils';
import { fetchListStart } from '@waldur/table/actions';
import { Customer } from '@waldur/workspace/types';

export const getInitialValues = (props) => ({
  date_of_payment: props.resolve.date_of_payment,
  sum: props.resolve.sum,
});

export const updatePaymentsList = (customer: Customer) =>
  fetchListStart(PAYMENTS_TABLE, {
    profile_uuid: getActivePaymentProfile(customer.payment_profiles)?.uuid,
  });
