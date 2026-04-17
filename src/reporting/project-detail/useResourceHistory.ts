import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import {
  marketplaceResourcesList,
  marketplaceResourcesRetrieve,
  marketplaceResourcesOfferingRetrieve,
  marketplaceOrdersList,
  marketplaceComponentUsagesList,
  Resource,
  OrderDetails,
  OfferingComponent,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@waldur/core/api';
import { STALE_TIME } from '@waldur/core/constants';
import { parseDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

import {
  ResourceOption,
  LimitHistoryPoint,
  UsageHistoryPoint,
  ComponentTypeOption,
  ComponentLabelMap,
} from './types';

interface UseResourceHistoryOptions {
  projectUuid?: string;
  resourceUuid?: string;
  componentType?: string;
  enabled?: boolean;
}

/**
 * Fetches resources for a project that have limits.
 */
export const useProjectResources = (projectUuid?: string) => {
  return useQuery({
    queryKey: ['project-resources-for-history', projectUuid],
    queryFn: async ({ signal }) => {
      if (!projectUuid) return [];

      const resources = await getAllPages<Resource>((page) =>
        marketplaceResourcesList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            project_uuid: projectUuid,
            state: ['Creating', 'OK', 'Erred', 'Updating', 'Terminating'],
            field: ['uuid', 'name', 'limits'],
          },
          signal,
        }),
      );

      // Filter to resources with non-empty limits
      return resources
        .filter((r) => r.limits && Object.keys(r.limits).length > 0)
        .map(
          (r): ResourceOption => ({
            uuid: r.uuid,
            name: r.name || translate('Unnamed resource'),
            resource_name: r.name || translate('Unnamed resource'),
          }),
        );
    },
    enabled: !!projectUuid,
    staleTime: STALE_TIME,
  });
};

/**
 * Fetches offering components for a resource.
 * Returns both the components and a label map for easy lookup.
 */
export const useResourceOfferingComponents = (resourceUuid?: string) => {
  return useQuery({
    queryKey: ['resource-offering-components', resourceUuid],
    queryFn: async ({ signal }) => {
      if (!resourceUuid) return { components: [], labelMap: {} };

      // Fetch the offering for this resource to get component definitions
      const response = await marketplaceResourcesOfferingRetrieve({
        path: { uuid: resourceUuid },
        signal,
      });

      const offering = response.data;
      const components: OfferingComponent[] = offering?.components || [];

      // Build a label map from component type to display name
      const labelMap: ComponentLabelMap = {};
      for (const component of components) {
        if (component.type) {
          // Use name if available, otherwise format the type
          labelMap[component.type] =
            component.name || formatTypeAsLabel(component.type);
        }
      }

      return { components, labelMap };
    },
    enabled: !!resourceUuid,
    staleTime: STALE_TIME,
  });
};

/**
 * Fetches available component types for a resource.
 * Labels come from the offering's component definitions.
 */
export const useResourceComponentTypes = (resourceUuid?: string) => {
  const { data: offeringData } = useResourceOfferingComponents(resourceUuid);

  return useQuery({
    queryKey: [
      'resource-component-types',
      resourceUuid,
      offeringData?.labelMap,
    ],
    queryFn: async ({ signal }) => {
      if (!resourceUuid) return [];

      // Get resource to check its limits
      const response = await marketplaceResourcesRetrieve({
        path: { uuid: resourceUuid },
        query: {
          field: ['uuid', 'limits'],
        },
        signal,
      });

      const resource = response.data;
      if (!resource?.limits) return [];

      const labelMap = offeringData?.labelMap || {};

      const types: ComponentTypeOption[] = Object.keys(resource.limits).map(
        (type) => ({
          value: type,
          label: labelMap[type] || formatTypeAsLabel(type),
        }),
      );

      return types;
    },
    enabled: !!resourceUuid,
    staleTime: STALE_TIME,
  });
};

/**
 * Fetches limit history from order history.
 * Each order with limits shows how the limits changed over time.
 */
export const useResourceLimitsHistory = ({
  resourceUuid,
  componentType,
  enabled = true,
}: UseResourceHistoryOptions) => {
  return useQuery({
    queryKey: ['resource-limits-history', resourceUuid, componentType],
    queryFn: async ({ signal }) => {
      if (!resourceUuid) return [];

      // Fetch all orders for this resource
      const orders = await getAllPages<OrderDetails>((page) =>
        marketplaceOrdersList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            resource_uuid: resourceUuid,
            o: ['created'],
            field: [
              'uuid',
              'type',
              'created',
              'consumer_reviewed_at',
              'limits',
              'state',
            ],
          },
          signal,
        }),
      );

      // Extract limit history points from orders
      const limitHistory: LimitHistoryPoint[] = [];

      for (const order of orders) {
        // Only consider completed orders with limits
        if (
          order.state !== 'done' ||
          !order.limits ||
          typeof order.limits !== 'object'
        ) {
          continue;
        }

        const orderDate =
          order.consumer_reviewed_at || order.created || DateTime.now().toISO();

        // Add a point for each limit type in the order
        const limits = order.limits as Record<string, number>;
        for (const [limitName, limitValue] of Object.entries(limits)) {
          // Filter by component type if specified
          if (componentType && limitName !== componentType) continue;

          limitHistory.push({
            date: orderDate,
            limit_name: limitName,
            limit_value: limitValue ?? 0,
          });
        }
      }

      // Sort by date
      limitHistory.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      return limitHistory;
    },
    enabled: enabled && !!resourceUuid,
    staleTime: STALE_TIME,
  });
};

/**
 * Fetches usage history and calculates cumulative usage.
 */
export const useResourceUsageHistory = ({
  resourceUuid,
  componentType,
  enabled = true,
}: UseResourceHistoryOptions) => {
  return useQuery({
    queryKey: ['resource-usage-history', resourceUuid, componentType],
    queryFn: async ({ signal }) => {
      if (!resourceUuid) return [];

      // Fetch all component usages
      const usages = await getAllPages((page) =>
        marketplaceComponentUsagesList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            resource_uuid: resourceUuid,
            type: componentType || undefined,
            field: ['type', 'usage', 'billing_period'],
          },
          signal,
        }),
      );

      // Group usages by type and calculate cumulative
      const usagesByType: Record<string, UsageHistoryPoint[]> = {};

      for (const usage of usages) {
        const type = usage.type || 'unknown';
        if (!usagesByType[type]) {
          usagesByType[type] = [];
        }

        usagesByType[type].push({
          date: usage.billing_period,
          type,
          usage: usage.usage || 0,
          cumulative_usage: 0, // Will be calculated below
        });
      }

      // Sort each type by date and calculate cumulative
      const result: UsageHistoryPoint[] = [];

      for (const type of Object.keys(usagesByType)) {
        const typeUsages = usagesByType[type];
        typeUsages.sort(
          (a, b) => parseDate(a.date).toMillis() - parseDate(b.date).toMillis(),
        );

        let cumulative = 0;
        for (const point of typeUsages) {
          cumulative += point.usage;
          point.cumulative_usage = cumulative;
          result.push(point);
        }
      }

      // Sort all results by date
      result.sort(
        (a, b) => parseDate(a.date).toMillis() - parseDate(b.date).toMillis(),
      );

      return result;
    },
    enabled: enabled && !!resourceUuid,
    staleTime: STALE_TIME,
  });
};

/**
 * Formats a component type string as a human-readable label.
 * This is a fallback when offering component names are not available.
 * Converts snake_case to Title Case.
 */
function formatTypeAsLabel(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
