import React from 'react';

import { translate } from '@/i18n';
import { OfferingAutocomplete } from '@/marketplace/offerings/details/OfferingAutocomplete';
import { OrganizationAutocomplete } from '@/marketplace/orders/OrganizationAutocomplete';
import { ProjectFilter } from '@/marketplace/resources/list/ProjectFilter';
import { TableFilterItem } from '@/table/TableFilterItem';

import { createOrderStateOptions } from '../OrderStates';
import { ProviderAutocomplete } from '../ProviderAutocomplete';

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
      {props.hasOffering && (
        <TableFilterItem
          title={translate('Offering')}
          name="offering"
          badgeValue={(value) => `${value?.category_title} / ${value?.name}`}
        >
          <OfferingAutocomplete reactSelectProps={{ variant: 'tableFilter' }} />
        </TableFilterItem>
      )}
      {props.hasOrganization && (
        <TableFilterItem
          title={translate('Organization')}
          name="organization"
          badgeValue={(value) => value?.name}
        >
          <OrganizationAutocomplete
            reactSelectProps={{ variant: 'tableFilter' }}
          />
        </TableFilterItem>
      )}
      <TableFilterItem
        title={translate('Project')}
        name="project"
        badgeValue={(value) => value?.name}
      >
        <ProjectFilter reactSelectProps={{ variant: 'tableFilter' }} />
      </TableFilterItem>
      {props.hasOrganization && !provider_uuid && (
        <TableFilterItem
          title={translate('Service provider')}
          name="provider"
          getValueLabel={(option) => option.customer_name}
        >
          <ProviderAutocomplete reactSelectProps={{ variant: 'tableFilter' }} />
        </TableFilterItem>
      )}
      <TableFilterItem
        title={translate('State')}
        name="state"
        badgeValue={(value) => value?.label}
        ellipsis={false}
      >
        <OrderStateFilter options={createOrderStateOptions} />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Type')}
        name="type"
        badgeValue={(value) => value?.label}
        ellipsis={true}
      >
        <OrderTypeFilter />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Auto-approved')}
        name="was_auto_approved"
        badgeValue={(value) => value?.label}
        ellipsis={true}
      >
        <OrderAutoApprovedFilter />
      </TableFilterItem>
    </>
  );
};
