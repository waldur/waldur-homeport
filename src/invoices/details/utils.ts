import { createSelector } from 'reselect';

import { isVisible } from '@waldur/store/config';
import { getCustomer } from '@waldur/workspace/selectors';
import { PaymentProfile } from '@waldur/workspace/types';

import { InvoiceItem } from '../types';

export const groupInvoiceItems = (
  items: InvoiceItem[],
  sortKey = 'name',
  desc = false,
) => {
  const projectsMap = items.reduce((map, item) => {
    if (!item.project_uuid) {
      return map;
    }
    return { ...map, [item.project_uuid]: item.project_name };
  }, {});

  const resourcesMap = items.reduce((map, item) => {
    const resourceKey = item.resource_uuid || item.details.scope_uuid;
    if (!resourceKey) {
      return map;
    }
    return {
      ...map,
      [resourceKey]: {
        name: item.resource_name || item.name,
        uuid: resourceKey,
        service_provider_name: item.details.service_provider_name,
        offering_name: item.details.offering_name,
        plan_name: item.details.plan_name,
      },
    };
  }, {});

  const itemsMap = items.reduce((map, item) => {
    const projectKey = item.project_uuid || 'default';
    const project = (map[projectKey] = map[projectKey] || {});
    if (!project[item.resource_uuid]) {
      project[item.resource_uuid] = [];
    }
    project[item.resource_uuid].push(item);
    return map;
  }, {});

  const invoiceItems = Object.keys(projectsMap)
    .map((projectKey) => {
      const resources = Object.keys(itemsMap[projectKey])
        .map((resourceKey) => ({
          ...resourcesMap[resourceKey],
          items: itemsMap[projectKey][resourceKey],
          total: itemsMap[projectKey][resourceKey].reduce(
            (sum, item) => sum + parseFloat(item.total),
            0,
          ),
          price: itemsMap[projectKey][resourceKey].reduce(
            (sum, item) => sum + parseFloat(item.price),
            0,
          ),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      return {
        name: projectsMap[projectKey],
        resources,
        total: resources.reduce((sum, item) => sum + item.total, 0),
        price: resources.reduce((sum, item) => sum + item.price, 0),
      };
    })
    .sort((a, b) =>
      String(a[sortKey]).localeCompare(String(b[sortKey]), undefined, {
        numeric: true,
      }),
    );
  return desc ? invoiceItems.reverse() : invoiceItems;
};

// phone numbers specification https://www.itu.int/rec/T-REC-E.164-201011-I
export function formatPhone(value) {
  if (
    value === undefined ||
    value.national_number === undefined ||
    value.country_code === undefined
  ) {
    return value;
  }

  let nationalNumber = value.national_number || '';

  if (nationalNumber.length === 7) {
    nationalNumber = nationalNumber.replace(
      /(\d{3})(\d{2})(\d{2})/,
      '$1-$2-$3',
    );
  } else if (nationalNumber.length === 10) {
    nationalNumber = nationalNumber.replace(
      /(\d{3})(\d{3})(\d{4})/,
      '$1-$2-$3',
    );
  }

  return `(+${value.country_code})-${nationalNumber}`;
}

export const getActiveFixedPricePaymentProfile = (profiles: PaymentProfile[]) =>
  profiles?.find(
    (profile) => profile.is_active && profile.payment_type === 'fixed_price',
  );

export const getActivePaymentProfile = (profiles: PaymentProfile[]) =>
  profiles?.find((profile) => profile.is_active);

export const hasMonthlyPaymentProfile = createSelector(
  getCustomer,
  (customer) =>
    getActivePaymentProfile(customer.payment_profiles)?.payment_type ===
    'payment_gw_monthly',
);

export const showPriceSelector = createSelector(
  getCustomer,
  (state) => isVisible(state, 'marketplace.conceal_prices'),
  (customer, concealPricesFeatureToggle: boolean) =>
    !getActiveFixedPricePaymentProfile(customer.payment_profiles) &&
    !concealPricesFeatureToggle,
);
