import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { customerPermissionsReviewsList } from 'waldur-js-client';

import { PermissionsReviewsList } from '@/core/PermissionsReviewsList';
import { createFetcher } from '@/table/api';
import { useTable } from '@/table/useTable';
import { getCustomer } from '@/workspace/selectors';

const mapStateToProps = createSelector(getCustomer, (customer) => ({
  customer_uuid: customer.uuid,
  o: '-created',
}));

export const CustomerPermissionsReviewList: FunctionComponent<{}> = () => {
  const filter = useSelector(mapStateToProps);
  const tableProps = useTable({
    table: 'customer-permissions-reviews',
    fetchData: createFetcher(customerPermissionsReviewsList),
    filter,
  });

  return <PermissionsReviewsList tableProps={tableProps} scope="customer" />;
};
