import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { Field, InjectedFormProps, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';

import { syncFiltersToURL, useReinitializeFilterFromUrl } from '@/core/filters';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { OfferingAutocomplete } from '@/marketplace/offerings/details/OfferingAutocomplete';
import { parentOfferingFilter } from '@/marketplace/offerings/utils';
import { OrganizationAutocomplete } from '@/marketplace/orders/OrganizationAutocomplete';
import { PROVIDER_RESOURCES_LIST_FILTER_FORM_ID } from '@/marketplace/resources/list/constants';
import { type RootState } from '@/store/reducers';
import { TableFilterItem } from '@/table/TableFilterItem';
import {
  getCustomer,
  getUser,
  isOwnerOrStaff as isOwnerOrStaffSelector,
  isServiceManagerSelector,
} from '@/workspace/selectors';

import { CategoryFilter } from './CategoryFilter';
import { getStates, ResourceStateFilter } from './ResourceStateFilter';

type StateProps = ReturnType<typeof mapStateToProps> & InjectedFormProps;

const PureProviderResourcesFilter: FunctionComponent<StateProps> = (props) => {
  useReinitializeFilterFromUrl(props.form, {
    state: getStates().filter((state) => state.value !== 'Terminated'),
  });
  return (
    <>
      <TableFilterItem
        title={translate('Offering')}
        name="offering"
        badgeValue={(value) => `${value?.category_title} / ${value?.name}`}
      >
        <OfferingAutocomplete
          offeringFilter={props.offeringFilter}
          reactSelectProps={REACT_SELECT_TABLE_FILTER}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Parent offering')}
        name="parent_offering"
        badgeValue={(value) => `${value?.category_title} / ${value?.name}`}
      >
        <OfferingAutocomplete
          offeringFilter={parentOfferingFilter}
          reactSelectProps={REACT_SELECT_TABLE_FILTER}
          name="parent_offering"
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Client organization')}
        name="organization"
        badgeValue={(value) => value?.name}
      >
        <OrganizationAutocomplete
          reactSelectProps={REACT_SELECT_TABLE_FILTER}
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
          component={AwesomeCheckboxField}
          label={translate('Restrict member access')}
        />
      </TableFilterItem>
    </>
  );
};

const filterSelector = createSelector(
  getCustomer,
  getUser,
  isServiceManagerSelector,
  isOwnerOrStaffSelector,
  (customer, user, isServiceManager, isOwnerOrStaff) =>
    isServiceManager && !isOwnerOrStaff
      ? { customer_uuid: customer.uuid, service_manager_uuid: user.uuid }
      : {
          customer_uuid: customer.uuid,
        },
);

const mapStateToProps = (state: RootState) => ({
  offeringFilter: filterSelector(state),
});

const ConnectedComponent = connect(mapStateToProps)(
  PureProviderResourcesFilter,
);

export const ProviderResourcesFilter = reduxForm({
  form: PROVIDER_RESOURCES_LIST_FILTER_FORM_ID,
  onChange: syncFiltersToURL,
  destroyOnUnmount: false,
  enableReinitialize: true,
})(ConnectedComponent);
