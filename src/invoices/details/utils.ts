import { PaymentProfile } from 'waldur-js-client';

import { InvoiceItem, InvoiceTableItem } from '../types';

const getResourceKey = (item: InvoiceItem) =>
  item.resource_uuid || item.details.resource_uuid;

// Volume-discount and credit-compensation metadata is written into the
// free-form invoice item details blob by the billing pipeline and is not part
// of the generated SDK type.
export interface AdjustmentItemDetails {
  is_discount?: boolean;
  discount_type?: string;
  discount_formula?: string;
  discount_percent?: number;
  aggregated_usage?: number;
  offering_component_type?: string;
  offering_component_name?: string;
  discount_of_item?: string;
  is_compensation?: boolean;
  compensation_of_item?: string;
  plan_name?: string;
}

export const getDetails = (it: InvoiceItem) =>
  (it.details ?? {}) as AdjustmentItemDetails;

// An "adjustment" is a volume discount or a credit compensation — a system-
// generated line that reduces a specific component item.
export const isAdjustmentItem = (it: InvoiceItem) => {
  const d = getDetails(it);
  return Boolean(d.is_discount || d.is_compensation || it.credit);
};

export const groupInvoiceItems = (
  items: InvoiceItem[],
  orderBy?: string,
): InvoiceTableItem[] => {
  const groupedByProjectAndResource = items.reduce<
    Record<string, InvoiceTableItem>
  >((acc, item) => {
    const resourceKey = getResourceKey(item);
    const key = `${item.project_uuid}-${resourceKey}`;

    if (!acc[key]) {
      acc[key] = {
        uuid: key,
        resource_name:
          item.resource_name || item.details.resource_name || item.name,
        resource_uuid: resourceKey,
        offering_name: item.details.offering_name,
        offering_uuid: item.details.offering_uuid,
        project_name: item.project_name,
        project_uuid: item.project_uuid,
        service_provider_name: item.details.service_provider_name,
        service_provider_uuid: item.details.service_provider_uuid,
        plan_name: item.details.plan_name,
        price: 0,
        tax: 0,
        total: 0,
        items: [] as InvoiceItem[],
      };
    }

    acc[key].price += Number(item.price);
    acc[key].tax += Number(item.tax);
    acc[key].total += Number(item.total);

    acc[key].items.push(item);

    return acc;
  }, {});

  const groupedItems = Object.values(groupedByProjectAndResource);

  // A resource that changed plan during the month has lines priced by more
  // than one plan; name them all, in the order they were billed.
  for (const group of groupedItems) {
    const planNames = [...group.items]
      .sort((a, b) => String(a.start).localeCompare(String(b.start)))
      .map((item) => item.details?.plan_name)
      .filter((name, index, all) => name && all.indexOf(name) === index);
    if (planNames.length > 1) {
      group.plan_name = planNames.join(' → ');
      group.hasPlanChange = true;
    }
  }

  // Apply sorting if specified
  if (orderBy) {
    const isDescending = orderBy.startsWith('-');
    const field = isDescending ? orderBy.substring(1) : orderBy;

    if (field === 'project_name') {
      groupedItems.sort((a, b) => {
        const comparison = a.project_name.localeCompare(b.project_name);
        return isDescending ? -comparison : comparison;
      });
    } else if (field === 'offering_name') {
      groupedItems.sort((a, b) => {
        const comparison = a.offering_name.localeCompare(b.offering_name);
        return isDescending ? -comparison : comparison;
      });
    } else if (field === 'resource_name') {
      groupedItems.sort((a, b) => {
        const comparison = a.resource_name.localeCompare(b.resource_name);
        return isDescending ? -comparison : comparison;
      });
    } else if (field === 'service_provider_name') {
      groupedItems.sort((a, b) => {
        const comparison = a.service_provider_name.localeCompare(
          b.service_provider_name,
        );
        return isDescending ? -comparison : comparison;
      });
    } else if (field === 'plan_name') {
      groupedItems.sort((a, b) => {
        const comparison = a.plan_name.localeCompare(b.plan_name);
        return isDescending ? -comparison : comparison;
      });
    }
  }

  return groupedItems;
};

export const getActiveFixedPricePaymentProfile = (profiles: PaymentProfile[]) =>
  profiles?.find(
    (profile) => profile.is_active && profile.payment_type === 'fixed_price',
  );

export const getActivePaymentProfile = (profiles: PaymentProfile[]) =>
  profiles?.find((profile) => profile.is_active);

export const hasMonthlyPaymentProfile = (customer) =>
  getActivePaymentProfile(customer?.payment_profiles)?.payment_type ===
  'payment_gw_monthly';

export interface InvoicePlanGroup {
  plan_name: string;
  items: InvoiceItem[];
  start?: string;
  end?: string;
  price: number;
  total: number;
}

/**
 * Split a resource's invoice lines by the plan that priced them, in the order
 * the plans were billed. A discount or compensation line carries no plan of
 * its own and follows the item it adjusts. Lines without a plan name form a
 * final group.
 */
export const groupItemsByPlan = (items: InvoiceItem[]): InvoicePlanGroup[] => {
  const planByItem = new Map<string, string>();
  for (const item of items) {
    if (!isAdjustmentItem(item)) {
      planByItem.set(item.uuid, getDetails(item).plan_name || '');
    }
  }
  const planNameOf = (item: InvoiceItem): string => {
    const d = getDetails(item);
    const parent = d.discount_of_item ?? d.compensation_of_item;
    if (parent && planByItem.has(parent)) {
      return planByItem.get(parent);
    }
    return d.plan_name || '';
  };
  const groups: InvoicePlanGroup[] = [];
  for (const item of items) {
    const planName = planNameOf(item);
    let group = groups.find((g) => g.plan_name === planName);
    if (!group) {
      group = { plan_name: planName, items: [], price: 0, total: 0 };
      groups.push(group);
    }
    group.items.push(item);
    group.price += Number(item.price);
    group.total += Number(item.total);
    if (item.start && (!group.start || item.start < group.start)) {
      group.start = item.start;
    }
    if (item.end && (!group.end || item.end > group.end)) {
      group.end = item.end;
    }
  }
  groups.sort((a, b) => {
    // Lines that belong to no plan close the list.
    if (!a.plan_name !== !b.plan_name) {
      return a.plan_name ? -1 : 1;
    }
    return String(a.start ?? '').localeCompare(String(b.start ?? ''));
  });
  return groups;
};
