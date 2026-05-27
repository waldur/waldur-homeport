import { PaymentProfile } from 'waldur-js-client';

import { InvoiceItem, InvoiceTableItem } from '../types';

const getResourceKey = (item: InvoiceItem) =>
  item.resource_uuid || item.details.resource_uuid;

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
