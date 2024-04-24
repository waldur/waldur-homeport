import { useCurrentStateAndParams } from '@uirouter/react';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { ProjectFilter } from '@waldur/marketplace/resources/list/ProjectFilter';
import { TableFilterItem } from '@waldur/table/TableFilterItem';
import { getCustomer } from '@waldur/workspace/selectors';

import { OrderState } from '../types';

import { CUSTOMER_ORDERS_LIST_FILTER_FORM_ID } from './constants';
import { OrderStateFilter } from './OrderStateFilter';
import { OrderTypeFilter } from './OrderTypeFilter';

const getOrderStateFilterOptions = (): {
  value: OrderState;
  label: string;
}[] => [
  { value: 'executing', label: translate('Executing') },
  {
    value: 'pending-consumer',
    label: translate('Pending consumer approval'),
  },
  {
    value: 'pending-provider',
    label: translate('Pending provider approval'),
  },
  { value: 'done', label: translate('Done') },
  { value: 'erred', label: translate('Erred') },
  { value: 'canceled', label: translate('Canceled') },
  { value: 'rejected', label: translate('Rejected') },
];

const PureCustomerOrdersListFilter: React.FC = () => {
  const customer = useSelector(getCustomer);
  const { state } = useCurrentStateAndParams();
  return (
    <>
      <TableFilterItem
        title={translate('Offering')}
        name="offering"
        badgeValue={(value) => `${value?.category_title} / ${value?.name}`}
      >
        <OfferingAutocomplete />
      </TableFilterItem>
      {state.parent !== 'project' && (
        <TableFilterItem
          title={translate('Project')}
          name="project"
          badgeValue={(value) => value?.name}
        >
          <ProjectFilter customer_uuid={customer.uuid} />
        </TableFilterItem>
      )}
      <TableFilterItem
        title={translate('State')}
        name="state"
        badgeValue={(value) => value?.label}
        ellipsis={false}
      >
        <OrderStateFilter options={getOrderStateFilterOptions} />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Type')}
        name="type"
        badgeValue={(value) => value?.label}
        ellipsis={true}
      >
        <OrderTypeFilter />
      </TableFilterItem>
    </>
  );
};
const mapStateToProps = (state) => ({
  customer: getCustomer(state),
});

const enhance = compose(
  connect(mapStateToProps),
  reduxForm({
    form: CUSTOMER_ORDERS_LIST_FILTER_FORM_ID,
    destroyOnUnmount: false,
    initialValues: {
      state: getOrderStateFilterOptions()[0],
    },
  }),
);

export const CustomerOrdersListFilter = enhance(
  PureCustomerOrdersListFilter,
) as React.ComponentType<{}>;
