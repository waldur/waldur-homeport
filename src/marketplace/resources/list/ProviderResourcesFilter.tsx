import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { OfferingAutocomplete } from '@/marketplace/offerings/details/OfferingAutocomplete';
import { parentOfferingFilter } from '@/marketplace/offerings/utils';
import { OrganizationAutocomplete } from '@/marketplace/orders/OrganizationAutocomplete';
import { TableFilterItem } from '@/table/TableFilterItem';
import {
  getCustomer,
  getUser,
  isOwnerOrStaff as isOwnerOrStaffSelector,
  isServiceManagerSelector,
} from '@/workspace/selectors';

import { CategoryFilter } from './CategoryFilter';
import { ResourceStateFilter } from './ResourceStateFilter';

const filterSelector = createSelector(
  getCustomer,
  getUser,
  isServiceManagerSelector,
  isOwnerOrStaffSelector,
  (customer, user, isServiceManager, isOwnerOrStaff) =>
    isServiceManager && !isOwnerOrStaff
      ? { customer_uuid: customer?.uuid, service_manager_uuid: user?.uuid }
      : {
          customer_uuid: customer?.uuid,
        },
);

export const ProviderResourcesFilter: FunctionComponent = () => {
  const offeringFilter = useSelector(filterSelector);

  return (
    <>
      <TableFilterItem
        title={translate('Offering')}
        name="offering"
        badgeValue={(value) => `${value?.category_title} / ${value?.name}`}
      >
        <OfferingAutocomplete
          offeringFilter={offeringFilter}
          reactSelectProps={{ variant: 'tableFilter' }}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Parent offering')}
        name="parent_offering"
        badgeValue={(value) => `${value?.category_title} / ${value?.name}`}
      >
        <OfferingAutocomplete
          offeringFilter={parentOfferingFilter}
          reactSelectProps={{ variant: 'tableFilter' }}
          name="parent_offering"
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Client organization')}
        name="organization"
        badgeValue={(value) => value?.name}
      >
        <OrganizationAutocomplete
          reactSelectProps={{ variant: 'tableFilter' }}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Category')}
        name="category"
        badgeValue={(value) => value?.title}
      >
        <CategoryFilter />
      </TableFilterItem>
      <TableFilterItem
        title={translate('State')}
        name="state"
        instantApply={false}
      >
        <ResourceStateFilter />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Include terminated')}
        name="include_terminated"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
      >
        <Field
          name="include_terminated"
          type="checkbox"
          component={AwesomeCheckboxField}
          label={translate('Include terminated')}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Paused')}
        name="paused"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
      >
        <Field
          name="paused"
          type="checkbox"
          component={AwesomeCheckboxField}
          label={translate('Paused')}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Downscaled')}
        name="downscaled"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
      >
        <Field
          name="downscaled"
          type="checkbox"
          component={AwesomeCheckboxField}
          label={translate('Downscaled')}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Restrict member access')}
        name="restrict_member_access"
        badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
      >
        <Field
          name="restrict_member_access"
          type="checkbox"
          component={AwesomeCheckboxField}
          label={translate('Restrict member access')}
        />
      </TableFilterItem>
    </>
  );
};
