import {
  Project,
  projectsRetrieve,
  Offering,
  customersList,
  CustomersListData,
} from 'waldur-js-client';

import { getCustomer } from '@/customer/utils';
import { getOfferingRestrictedRoles } from '@/marketplace/offerings/utils';
import { Customer } from '@/workspace/types';

import { MarketplaceFilterItem } from '../landing/filter/types';

interface InitContext {
  urlParams: Record<string, any>;
  marketplaceFilters: MarketplaceFilterItem[];
  currentProject: Project;
  currentCustomer: Customer;
  selectedOffering?: Offering;
}

/**
 * Resolves project for deploy form with priority:
 * 1. Offering's project (for non-shared offerings)
 * 2. URL params (project_uuid or project object)
 * 3. Marketplace filters
 * 4. Current workspace project
 *
 * Handles legacy compact URL format (uuid::name) by fetching full project.
 */
export const resolveProject = async (
  context: InitContext,
): Promise<{ project?: Project; customer?: Customer }> => {
  const {
    urlParams,
    marketplaceFilters,
    currentProject,
    currentCustomer,
    selectedOffering,
  } = context;

  // Priority 1: Offering's project (for non-shared offerings)
  if (selectedOffering?.project) {
    return {
      project: {
        name: selectedOffering.project_name,
        uuid: selectedOffering.project_uuid,
        url: selectedOffering.project,
      } as Project,
    };
  }

  // Priority 2: URL params
  if (urlParams?.project_uuid?.uuid) {
    try {
      const response = await projectsRetrieve({
        path: { uuid: urlParams.project_uuid.uuid },
      });
      return { project: response.data };
    } catch {
      // Failed to load project from URL param, continue with fallback
    }
  } else if (urlParams?.project?.uuid) {
    // Recover project from UUID
    try {
      const response = await projectsRetrieve({
        path: { uuid: urlParams.project.uuid },
      });
      return { project: response.data };
    } catch {
      // Failed to load project, continue with fallback
    }
  }

  // Priority 3: Marketplace filters
  const projectFilter = marketplaceFilters?.find(
    (item) => item.name === 'project',
  );
  if (projectFilter?.value?.url) {
    return { project: projectFilter.value };
  } else if (projectFilter?.value?.uuid) {
    try {
      const response = await projectsRetrieve({
        path: { uuid: projectFilter.value.uuid },
      });
      return { project: response.data };
    } catch {
      // Failed to load project, continue with fallback
    }
  }

  // Priority 4: Current workspace
  if (currentProject) {
    return { project: currentProject, customer: currentCustomer };
  }

  return {};
};

/**
 * Resolves customer (organization) for deploy form with priority:
 * 1. Offering's customer (for non-shared offerings)
 * 2. URL params (organization_uuid or organization object)
 * 3. Marketplace filters
 * 4. Current workspace customer
 * 5. The only organization the user may order from, when there is just one
 *
 * Handles legacy compact URL format (uuid::name) by fetching full customer.
 */
export const resolveCustomer = async (
  context: InitContext,
): Promise<Customer | undefined> => {
  const { urlParams, marketplaceFilters, currentCustomer, selectedOffering } =
    context;

  // Priority 1: Offering's customer (for non-shared offerings)
  if (selectedOffering && !selectedOffering.shared) {
    return {
      name: selectedOffering.customer_name,
      uuid: selectedOffering.customer_uuid,
      url: selectedOffering.customer,
      payment_profiles: [],
    } as Customer;
  }

  // Priority 2: URL params
  if (urlParams?.organization_uuid?.uuid) {
    try {
      return await getCustomer(urlParams.organization_uuid.uuid);
    } catch {
      // Failed to load organization from URL param, continue with fallback
    }
  } else if (urlParams?.organization?.uuid) {
    // Recover organization from UUID
    try {
      return await getCustomer(urlParams.organization.uuid);
    } catch {
      // Failed to load organization, continue with fallback
    }
  }

  // Priority 3: Marketplace filters
  const customerFilter = marketplaceFilters?.find(
    (item) => item.name === 'organization',
  );
  if (customerFilter?.value?.url) {
    return customerFilter.value;
  } else if (customerFilter?.value?.uuid) {
    try {
      return await getCustomer(customerFilter.value.uuid);
    } catch {
      // Failed to load organization, continue with fallback
    }
  }

  // Priority 4: Current workspace
  if (currentCustomer) {
    return currentCustomer;
  }

  // Priority 5: the only organization on offer, since that is no decision at
  // all. The query mirrors the organization select's own, so this can never
  // pick something the select would not list.
  try {
    const query: CustomersListData['query'] = {
      field: ['name', 'uuid', 'url', 'payment_profiles'],
      // Two results are enough to tell "the only one" from "one of several".
      page_size: 2,
    };
    const organizationGroups = selectedOffering?.organization_groups ?? [];
    if (organizationGroups.length) {
      query.organization_group_uuid = organizationGroups.map(
        (group) => group.uuid,
      );
    }
    const roles = selectedOffering
      ? getOfferingRestrictedRoles(selectedOffering)
      : [];
    if (roles.length) {
      query.current_user_has_role = roles;
    }
    const customers = await customersList({ query }).then((r) => r.data);
    if (customers.length === 1) {
      return customers[0] as Customer;
    }
  } catch {
    // Failed to load organizations, leave the field for the user to fill
  }

  return undefined;
};
