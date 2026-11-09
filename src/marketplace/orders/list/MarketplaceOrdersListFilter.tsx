import React from 'react';

import { OfferingFilter } from '@/marketplace/offerings/details/OfferingFilter';
import { OrganizationFilter } from '@/marketplace/orders/OrganizationFilter';
import { ProviderFilter } from '@/marketplace/orders/ProviderFilter';
import { ProjectFilter } from '@/marketplace/resources/list/ProjectFilter';
import { facetOption } from '@/table/facets';

import { createOrderStateOptions } from '../OrderStates';

import { OrderAutoApprovedFilter } from './OrderAutoApprovedFilter';
import { OrderStateFilter } from './OrderStateFilter';
import { OrderTypeFilter } from './OrderTypeFilter';

const byName = facetOption('uuid', 'name');
const byProvider = facetOption('customer_uuid', 'customer_name');

// The facet props take effect where the orders table counts facets
// (OrdersTableComponent).
interface OrdersListFilterProps {
  hasOffering?: boolean;
  hasOrganization?: boolean;
  provider_uuid?: string;
}

export const OrdersListFilter: React.FC<OrdersListFilterProps> = (props) => {
  const { provider_uuid } = props;

  return (
    <>
      {props.hasOffering && <OfferingFilter facet="offering" />}
      {props.hasOrganization && (
        <OrganizationFilter facet="customer" facetOption={byName} />
      )}
      <ProjectFilter facet="project" facetOption={byName} />
      {props.hasOrganization && !provider_uuid && (
        <ProviderFilter
          getValueLabel={(option) => option.customer_name}
          facet="provider"
          facetOption={byProvider}
        />
      )}
      <OrderStateFilter
        options={createOrderStateOptions}
        ellipsis={false}
        facet="state"
      />
      <OrderTypeFilter facet="type" />
      <OrderAutoApprovedFilter />
    </>
  );
};
