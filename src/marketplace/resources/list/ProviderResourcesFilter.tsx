import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { Field, InjectedFormProps, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';

import {
  syncFiltersToURL,
  useReinitializeFilterFromUrl,
} from '@waldur/core/filters';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { parentOfferingFilter } from '@waldur/marketplace/offerings/utils';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { PROVIDER_RESOURCES_LIST_FILTER_FORM_ID } from '@waldur/marketplace/resources/list/constants';
import { type RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';
import {
  getCustomer,
  getUser,
  isOwnerOrStaff as isOwnerOrStaffSelector,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

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
