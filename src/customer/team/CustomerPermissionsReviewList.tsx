import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { customerPermissionsReviewsList } from 'waldur-js-client';

import { PermissionsReviewsList } from '@waldur/core/PermissionsReviewsList';
import { createFetcher } from '@waldur/table/api';
import { useTable } from '@waldur/table/useTable';
import { getCustomer } from '@waldur/workspace/selectors';

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
