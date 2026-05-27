import { FunctionComponent, useMemo } from 'react';
import { customerPermissionsReviewsList } from 'waldur-js-client';

import { PermissionsReviewsList } from '@/core/PermissionsReviewsList';
import { createFetcher } from '@/table/api';
import { useTable } from '@/table/useTable';
import { useCustomer } from '@/workspace/hooks';

export const CustomerPermissionsReviewList: FunctionComponent<{}> = () => {
  const customer = useCustomer();
  const filter = useMemo(
    () => ({
      customer_uuid: customer?.uuid,
      o: '-created',
    }),
    [customer],
  );
  const tableProps = useTable({
    table: 'customer-permissions-reviews',
    fetchData: createFetcher(customerPermissionsReviewsList),
    filter,
  });

  return <PermissionsReviewsList tableProps={tableProps} scope="customer" />;
};
