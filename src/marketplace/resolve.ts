import { Transition } from '@uirouter/react';
import { ServiceProvider } from 'waldur-js-client';

import { fetchCustomer } from '@/customer/workspace/fetchCustomer';
import { Customer } from '@/workspace/types';

import { getServiceProviderByCustomer } from './common/api';

export const fetchProvider = (transition: Transition) =>
  getServiceProviderByCustomer({
    customer_uuid: transition.params().uuid,
  });

/**
 * The customer fields a ServiceProvider record can supply, for use when the
 * customer itself is unreadable. Deliberately partial: `ServiceProvider` has no
 * counterpart for `call_managing_organization_uuid` or `has_active_helpdesk`,
 * so the Call management and Helpdesk tabs stay hidden on this path (see
 * `OrganizationUIView`). Everything the hero renders beyond those degrades on
 * its own — each field is rendered only when present.
 */
const customerFromProvider = (provider: ServiceProvider): Customer =>
  ({
    url: provider.customer,
    uuid: provider.customer_uuid,
    name: provider.customer_name,
    abbreviation: provider.customer_abbreviation,
    image: provider.customer_image,
    country: provider.customer_country,
    organization_groups: provider.organization_groups,
    is_service_provider: true,
    service_provider: provider.url,
    service_provider_uuid: provider.uuid,
  }) as Customer;

/**
 * "Service provider manager" (CUSTOMER.MANAGER) is granted on the ServiceProvider
 * object, not on its customer, so GET /api/customers/<uuid>/ answers 404 for the
 * people who run the provider even though the provider APIs honour their role.
 */
export const fetchProviderCustomer = (transition: Transition) =>
  fetchCustomer(transition, async () => {
    // `marketplace-provider` resolves this same record under the `provider`
    // token, so ask the injector for it rather than issuing a second identical
    // request: a resolvable hands back its in-flight promise and only starts
    // the fetch when nobody else has. Pulled here rather than declared as a
    // dep so the common path, where the customer reads fine, does not wait on
    // it.
    const provider = await transition
      .injector()
      .getAsync<ServiceProvider>('provider');
    return provider ? customerFromProvider(provider) : undefined;
  });
