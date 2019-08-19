import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { withTranslation } from '@waldur/i18n';
import { connectTable } from '@waldur/table-react';
import { getCustomer } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

import { TableComponent, TableOptions } from './OfferingsList';

const mapPropsToFilter = props => {
  const filter: Record<string, string | boolean> = {
    billable: false,
  };
  if (props.customer) {
    filter.customer_uuid = props.customer.uuid;
  }
  if (props.filter) {
    if (props.filter.state) {
      filter.state = props.filter.state.map(option => option.value);
    }
  }
  return filter;
};

const enhance = compose(
  connect((state: OuterState) => ({
    customer: getCustomer(state),
    actionsDisabled: true,
    showOfferingCreateButton: false,
    filter: getFormValues('OfferingsFilter')(state),
  })),
  connectTable({
    ...TableOptions,
    table: 'marketplace-my-offerings',
    mapPropsToFilter,
  }),
  withTranslation,
);

export const MyOfferingsList = enhance(TableComponent);
