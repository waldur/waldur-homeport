import { OrderResponse } from '../types';

import { ApproveByProviderButton } from './ApproveByProviderButton';
import { RejectByProviderButton } from './RejectByProviderButton';

export const OrderProviderActions = ({
  row,
  refetch,
}: {
  row: OrderResponse;
  refetch?(): void;
}) =>
  row.state === 'pending-provider' ? (
    <>
      <ApproveByProviderButton orderUuid={row.uuid} refetch={refetch} />
      <RejectByProviderButton orderUuid={row.uuid} refetch={refetch} />
    </>
  ) : (
    <>N/A</>
  );
