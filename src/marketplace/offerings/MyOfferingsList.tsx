import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';
import { connectTable } from '@waldur/table-react';
import { getCustomer } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

import { TableComponent, TableOptions } from './OfferingsList';

const enhance = compose(
  connect((state: OuterState) => ({
    customer: getCustomer(state),
    actionsDisabled: true,
    showOfferingCreateButton: false,
  })),
  connectTable({
    ...TableOptions,
    table: 'marketplace-my-offerings',
    mapPropsToFilter: props => ({
      customer_uuid: props.customer.uuid,
      billable: false,
    }),
  }),
  withTranslation,
);

export const MyOfferingsList = enhance(TableComponent);

export default connectAngularComponent(MyOfferingsList);
