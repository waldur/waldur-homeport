import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { getCustomer } from '@waldur/workspace/selectors';

import { OfferingCreateButton } from './OfferingCreateButton';
import { OfferingDeleteButton } from './OfferingDeleteButton';

export const TableComponent = props => {
  const { translate } = props;

  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => row.name,
    },
    {
      title: translate('Category'),
      render: ({ row }) => row.category_title,
    },
    {
      title: translate('State'),
      render: ({ row }) => row.state,
    },
    {
      title: translate('Actions'),
      render: OfferingDeleteButton,
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Offerings')}
      actions={<OfferingCreateButton/>}
    />
  );
};

const TableOptions = {
  table: 'marketplace-offerings',
  fetchData: createFetcher('marketplace-offerings'),
  mapPropsToFilter: props => ({
    customer_uuid: props.customer.uuid,
  }),
  exportRow: row => [
    row.name,
    row.native_name,
    row.category_title,
    row.state,
  ],
  exportFields: [
    'Name',
    'Native name',
    'Category',
    'State',
  ],
};

const mapStateToProps = state => ({ customer: getCustomer(state) });

const enhance = compose(
  connect(mapStateToProps),
  connectTable(TableOptions),
  withTranslation,
);

export const VendorOfferingsList = enhance(TableComponent);

export default connectAngularComponent(VendorOfferingsList);
