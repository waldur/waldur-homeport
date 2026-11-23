import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  marketplaceProviderOfferingsOrderFlowDescriptionRetrieve,
  OrderFlowDescription,
  OrderFlowDescriptionOrderKindEnum,
  OrderFlowDescriptionOrdererEnum,
} from 'waldur-js-client';

import { OWN_ERROR_STATE } from '@/core/queryRetry';

export interface OrderFlowQuery {
  orderKind: OrderFlowDescriptionOrderKindEnum;
  orderer: OrderFlowDescriptionOrdererEnum;
  role?: string;
  withStats: boolean;
}

/** How orders for the offering move, for one order kind and orderer. */
export const useOrderFlowDescription = (
  offeringUuid: string,
  query: OrderFlowQuery,
) =>
  useQuery<OrderFlowDescription>({
    queryKey: ['offeringOrderFlowDescription', offeringUuid, query],
    queryFn: () =>
      marketplaceProviderOfferingsOrderFlowDescriptionRetrieve({
        path: { uuid: offeringUuid },
        query: {
          order_kind: query.orderKind,
          orderer: query.orderer,
          role: query.orderer === 'role' ? query.role : undefined,
          with_stats: query.withStats,
        },
      }).then((response) => response.data),
    // Switching the order kind or orderer keeps the last drawing in place
    // until the next one arrives, instead of flashing a spinner.
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    retry: false,
    meta: OWN_ERROR_STATE,
  });
