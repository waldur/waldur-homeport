import { useQuery } from '@tanstack/react-query';
import {
  marketplacePosixIdPoolsList,
  marketplaceProviderOfferingsList,
  PosixIdPool,
  ProviderOfferingDetails,
} from 'waldur-js-client';

export interface SharingOffering {
  uuid: string;
  name: string;
}

export interface OfferingAccountContext {
  /** Offerings of the provider whose accounts are held per service provider. */
  sharingOfferings?: SharingOffering[];
  /**
   * The pool the offering allocates POSIX IDs from: its own, else the
   * provider's. Null when there is none, undefined until loaded.
   */
  pool?: PosixIdPool | null;
}

/**
 * What an offering's account settings act on beyond the offering itself: the
 * offerings it shares accounts with and the POSIX ID pool its accounts draw
 * from.
 */
export const useOfferingAccountContext = (
  offering: ProviderOfferingDetails,
): OfferingAccountContext => {
  const customerUuid = offering.customer_uuid;
  const enabled = Boolean(customerUuid);

  const { data: sharingOfferings } = useQuery({
    queryKey: ['OfferingAccountSharing', customerUuid],
    queryFn: async () => {
      const response = await marketplaceProviderOfferingsList({
        query: {
          customer_uuid: customerUuid,
          field: ['uuid', 'name', 'state', 'account_settings'],
          page_size: 100,
        },
      });
      return response.data
        .filter(
          (item) =>
            item.state !== 'Archived' &&
            item.account_settings?.account_scope?.value === 'provider',
        )
        .map(({ uuid, name }) => ({ uuid, name }));
    },
    enabled,
    refetchOnWindowFocus: false,
  });

  const { data: pool } = useQuery({
    queryKey: ['OfferingPosixIdPool', customerUuid, offering.uuid],
    queryFn: async () => {
      const response = await marketplacePosixIdPoolsList({
        query: { customer_uuid: customerUuid, page_size: 100 },
      });
      const pools = response.data;
      // Mirrors the backend: an offering's own pool overrides the provider's.
      return (
        pools.find((item) => item.offering === offering.uuid) ??
        pools.find((item) => !item.offering) ??
        null
      );
    },
    enabled,
    refetchOnWindowFocus: false,
  });

  return { sharingOfferings, pool };
};
