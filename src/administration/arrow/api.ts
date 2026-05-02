import { useMutation, useQuery } from '@tanstack/react-query';
import {
  adminArrowBillingSyncItemsList,
  adminArrowBillingSyncsConsumptionStatusRetrieve,
  adminArrowConsumptionRecordsList,
  adminArrowCustomerMappingsAvailableCustomersRetrieve,
  adminArrowCustomerMappingsDiscoverLicensesRetrieve,
  adminArrowCustomerMappingsFetchArrowDataRetrieve,
  adminArrowSettingsDiscoverCustomers,
  adminArrowSettingsList,
  adminArrowSettingsValidateCredentials,
  type ArrowCredentialsRequest,
  type DiscoverCustomersRequestRequest,
} from 'waldur-js-client';

import { FAST_STALE_TIME, SHORT_STALE_TIME } from '@/core/constants';

// === Query Keys ===
export const arrowQueryKeys = {
  all: ['arrow'] as const,
  settings: () => [...arrowQueryKeys.all, 'settings'] as const,
  customerMappings: (settingsUuid?: string) =>
    [...arrowQueryKeys.all, 'customerMappings', settingsUuid] as const,
  availableCustomers: () =>
    [...arrowQueryKeys.all, 'availableCustomers'] as const,
  customerBillingSummary: (mappingUuid: string) =>
    [...arrowQueryKeys.all, 'customerBillingSummary', mappingUuid] as const,
  billingSyncs: (settingsUuid?: string) =>
    [...arrowQueryKeys.all, 'billingSyncs', settingsUuid] as const,
  billingSyncItems: (billingSyncUuid?: string) =>
    [...arrowQueryKeys.all, 'billingSyncItems', billingSyncUuid] as const,
  consumptionRecords: (settingsUuid?: string) =>
    [...arrowQueryKeys.all, 'consumptionRecords', settingsUuid] as const,
  consumptionStatistics: () =>
    [...arrowQueryKeys.all, 'consumptionStatistics'] as const,
  consumptionStatus: () =>
    [...arrowQueryKeys.all, 'consumptionStatus'] as const,
  resourceConsumption: (resourceUuid: string) =>
    [...arrowQueryKeys.all, 'resourceConsumption', resourceUuid] as const,
};

// === Query Hooks ===

/** Fetch Arrow settings (singleton) */
export const useArrowSettings = () =>
  useQuery({
    queryKey: arrowQueryKeys.settings(),
    queryFn: async () => {
      const response = await adminArrowSettingsList();
      // Return first settings or null if none exist
      return response.data?.[0] ?? null;
    },
    staleTime: FAST_STALE_TIME,
  });

/** Fetch available Arrow customers (not yet mapped) with suggestions */
export const useAvailableArrowCustomers = () =>
  useQuery({
    queryKey: arrowQueryKeys.availableCustomers(),
    queryFn: async () => {
      const response =
        await adminArrowCustomerMappingsAvailableCustomersRetrieve();
      return response.data;
    },
    staleTime: SHORT_STALE_TIME,
  });

/** Fetch fresh Arrow data for a customer */
export const useFetchCustomerArrowData = (mappingUuid: string) =>
  useQuery({
    queryKey: [...arrowQueryKeys.customerBillingSummary(mappingUuid), 'arrow'],
    queryFn: async () => {
      const response = await adminArrowCustomerMappingsFetchArrowDataRetrieve({
        path: { uuid: mappingUuid },
      });
      return response.data;
    },
    enabled: Boolean(mappingUuid),
    staleTime: SHORT_STALE_TIME, // Cache for 1 minute
  });

/** Discover Arrow licenses for a customer */
export const useDiscoverLicenses = (mappingUuid: string) =>
  useQuery({
    queryKey: [
      ...arrowQueryKeys.customerBillingSummary(mappingUuid),
      'discover',
    ],
    queryFn: async () => {
      const response = await adminArrowCustomerMappingsDiscoverLicensesRetrieve(
        {
          path: { uuid: mappingUuid },
        },
      );
      return response.data;
    },
    enabled: Boolean(mappingUuid),
    staleTime: SHORT_STALE_TIME,
  });

/** Fetch billing sync items */
export const useArrowBillingSyncItems = (billingSyncUuid?: string) =>
  useQuery({
    queryKey: arrowQueryKeys.billingSyncItems(billingSyncUuid),
    queryFn: async () => {
      const response = await adminArrowBillingSyncItemsList({
        query: billingSyncUuid
          ? { billing_sync_uuid: billingSyncUuid }
          : undefined,
      });
      return response.data;
    },
    enabled: Boolean(billingSyncUuid),
    staleTime: FAST_STALE_TIME,
  });

/** Fetch consumption status */
export const useArrowConsumptionStatus = () =>
  useQuery({
    queryKey: arrowQueryKeys.consumptionStatus(),
    queryFn: async () => {
      const response = await adminArrowBillingSyncsConsumptionStatusRetrieve();
      return response.data;
    },
    staleTime: SHORT_STALE_TIME,
  });

/** Fetch resource consumption history (last 12 months) */
export const useResourceConsumptionHistory = (resourceUuid: string) =>
  useQuery({
    queryKey: arrowQueryKeys.resourceConsumption(resourceUuid),
    queryFn: async () => {
      const response = await adminArrowConsumptionRecordsList({
        query: { resource_uuid: resourceUuid },
      });
      return response.data;
    },
    enabled: Boolean(resourceUuid),
    staleTime: FAST_STALE_TIME,
  });

// === Mutation Hooks ===

/** Validate Arrow credentials */
export const useValidateArrowCredentials = () => {
  return useMutation({
    mutationFn: (credentials: ArrowCredentialsRequest) =>
      adminArrowSettingsValidateCredentials({ body: credentials }),
  });
};

/** Discover Arrow customers */
export const useDiscoverArrowCustomers = () => {
  return useMutation({
    mutationFn: (credentials: DiscoverCustomersRequestRequest) =>
      adminArrowSettingsDiscoverCustomers({ body: credentials }),
  });
};
