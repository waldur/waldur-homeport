import React from 'react';

import { OfferingFilter } from '@/marketplace/offerings/details/OfferingFilter';
import { OrganizationFilter } from '@/marketplace/orders/OrganizationFilter';
import { ProviderFilter } from '@/marketplace/orders/ProviderFilter';
import { ProjectFilter } from '@/marketplace/resources/list/ProjectFilter';

import { createOrderStateOptions } from '../OrderStates';

import { OrderAutoApprovedFilter } from './OrderAutoApprovedFilter';
import { OrderStateFilter } from './OrderStateFilter';
import { OrderTypeFilter } from './OrderTypeFilter';

interface OrdersListFilterProps {
  hasOffering?: boolean;
  hasOrganization?: boolean;
  provider_uuid?: string;
}

export const OrdersListFilter: React.FC<OrdersListFilterProps> = (props) => {
  const { provider_uuid } = props;

  return (
    <>
      {props.hasOffering && <OfferingFilter />}
      {props.hasOrganization && <OrganizationFilter />}
      <ProjectFilter />
      {props.hasOrganization && !provider_uuid && (
        <ProviderFilter getValueLabel={(option) => option.customer_name} />
      )}
      <OrderStateFilter options={createOrderStateOptions} ellipsis={false} />
      <OrderTypeFilter />
      <OrderAutoApprovedFilter />
    </>
  );
};
