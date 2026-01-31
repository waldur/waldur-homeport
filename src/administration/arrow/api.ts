import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminArrowSettingsList,
  adminArrowSettingsDestroy,
  adminArrowSettingsPartialUpdate,
  adminArrowSettingsValidateCredentials,
  adminArrowSettingsDiscoverCustomers,
  adminArrowSettingsSaveSettings,
  adminArrowCustomerMappingsCreate,
  adminArrowCustomerMappingsDestroy,
  adminArrowCustomerMappingsPartialUpdate,
  adminArrowCustomerMappingsSyncFromArrow,
  adminArrowCustomerMappingsFetchArrowDataRetrieve,
  adminArrowCustomerMappingsDiscoverLicensesRetrieve,
  adminArrowCustomerMappingsLinkResource,
  adminArrowCustomerMappingsAvailableCustomersRetrieve,
  adminArrowBillingSyncsTriggerSync,
  adminArrowBillingSyncsTriggerReconciliation,
  adminArrowBillingSyncsTriggerConsumptionSync,
  adminArrowBillingSyncsPauseSync,
  adminArrowBillingSyncsResumeSync,
  adminArrowBillingSyncsCleanupConsumption,
  adminArrowBillingSyncsConsumptionStatusRetrieve,
  adminArrowBillingSyncItemsList,
  adminArrowConsumptionRecordsList,
  type ArrowCredentialsRequest,
  type ArrowCustomerMappingCreateRequest,
  type PatchedArrowCustomerMappingRequest,
  type PatchedArrowSettingsRequest,
  type SyncFromArrowRequestRequest,
  type DiscoverCustomersRequestRequest,
  type SaveSettingsRequestRequest,
  type TriggerSyncRequestRequest,
  type ReconcileRequestRequest,
  type TriggerConsumptionSyncRequestRequest,
  type LinkResourceRequestRequest,
} from 'waldur-js-client';

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
    staleTime: 30000,
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
    staleTime: 60000,
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
    staleTime: 60000, // Cache for 1 minute
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
    staleTime: 60000,
  });

/** Link a Waldur resource to an Arrow license */
export const useLinkResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      mappingUuid,
      data,
    }: {
      mappingUuid: string;
      data: LinkResourceRequestRequest;
    }) =>
      adminArrowCustomerMappingsLinkResource({
        path: { uuid: mappingUuid },
        body: data,
      }),
    onSuccess: (_, variables) => {
      // Invalidate discover licenses query to refresh the list
      queryClient.invalidateQueries({
        queryKey: [
          ...arrowQueryKeys.customerBillingSummary(variables.mappingUuid),
          'discover',
        ],
      });
      // Invalidate the fetch arrow data query as well
      queryClient.invalidateQueries({
        queryKey: [
          ...arrowQueryKeys.customerBillingSummary(variables.mappingUuid),
          'arrow',
        ],
      });
    },
  });
};

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
    staleTime: 30000,
  });

/** Fetch consumption status */
export const useArrowConsumptionStatus = () =>
  useQuery({
    queryKey: arrowQueryKeys.consumptionStatus(),
    queryFn: async () => {
      const response = await adminArrowBillingSyncsConsumptionStatusRetrieve();
      return response.data;
    },
    staleTime: 60000,
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
    staleTime: 30000,
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

/** Save Arrow settings (setup wizard) */
export const useSaveArrowSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SaveSettingsRequestRequest) =>
      adminArrowSettingsSaveSettings({ body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arrowQueryKeys.all });
    },
  });
};

/** Update Arrow settings */
export const useUpdateArrowSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      uuid,
      data,
    }: {
      uuid: string;
      data: PatchedArrowSettingsRequest;
    }) => adminArrowSettingsPartialUpdate({ path: { uuid }, body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arrowQueryKeys.settings() });
    },
  });
};

/** Delete Arrow settings */
export const useDeleteArrowSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => adminArrowSettingsDestroy({ path: { uuid } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arrowQueryKeys.all });
    },
  });
};

/** Create customer mapping */
export const useCreateCustomerMapping = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ArrowCustomerMappingCreateRequest) =>
      adminArrowCustomerMappingsCreate({ body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: arrowQueryKeys.customerMappings(),
      });
    },
  });
};

/** Update customer mapping */
export const useUpdateCustomerMapping = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      uuid,
      data,
    }: {
      uuid: string;
      data: PatchedArrowCustomerMappingRequest;
    }) =>
      adminArrowCustomerMappingsPartialUpdate({ path: { uuid }, body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: arrowQueryKeys.customerMappings(),
      });
    },
  });
};

/** Delete customer mapping */
export const useDeleteCustomerMapping = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) =>
      adminArrowCustomerMappingsDestroy({ path: { uuid } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: arrowQueryKeys.customerMappings(),
      });
    },
  });
};

/** Sync from Arrow */
export const useSyncFromArrow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data?: SyncFromArrowRequestRequest) =>
      adminArrowCustomerMappingsSyncFromArrow({ body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: arrowQueryKeys.customerMappings(),
      });
    },
  });
};

/** Trigger billing sync */
export const useTriggerBillingSync = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TriggerSyncRequestRequest) =>
      adminArrowBillingSyncsTriggerSync({ body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: arrowQueryKeys.billingSyncs(),
      });
    },
  });
};

/** Trigger reconciliation */
export const useTriggerReconciliation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReconcileRequestRequest) =>
      adminArrowBillingSyncsTriggerReconciliation({ body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: arrowQueryKeys.billingSyncs(),
      });
    },
  });
};

/** Trigger consumption sync */
export const useTriggerConsumptionSync = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TriggerConsumptionSyncRequestRequest) =>
      adminArrowBillingSyncsTriggerConsumptionSync({ body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: arrowQueryKeys.consumptionRecords(),
      });
    },
  });
};

/** Pause sync */
export const usePauseSync = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminArrowBillingSyncsPauseSync(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arrowQueryKeys.settings() });
    },
  });
};

/** Resume sync */
export const useResumeSync = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminArrowBillingSyncsResumeSync(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arrowQueryKeys.settings() });
    },
  });
};

/** Cleanup consumption */
export const useCleanupConsumption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminArrowBillingSyncsCleanupConsumption(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: arrowQueryKeys.consumptionRecords(),
      });
      queryClient.invalidateQueries({
        queryKey: arrowQueryKeys.billingSyncs(),
      });
    },
  });
};
