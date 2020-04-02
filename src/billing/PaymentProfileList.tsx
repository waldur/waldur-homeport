import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { ActionButton } from '@waldur/table-react/ActionButton';
import { getCustomer } from '@waldur/workspace/selectors';

export const TableComponent = props => {
  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => row.name,
    },
    {
      title: translate('Type'),
      render: ({ row }) => row.payment_type_display,
    },
    {
      title: translate('State'),
      render: ({ row }) => (
        <StateIndicator
          label={row.is_active ? translate('Enabled') : translate('Disabled')}
          variant={row.is_active ? 'success' : 'plain'}
        />
      ),
    },
    {
      title: translate('Actions'),
      render: () => (
        <>
          <ActionButton
            title={translate('Edit')}
            action={() => alert('Not implemented')}
            icon="fa fa-edit"
          />
          <ActionButton
            title={translate('Delete')}
            action={() => alert('Not implemented')}
            icon="fa fa-trash"
          />
        </>
      ),
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('payment profiles')}
      showPageSizeSelector={true}
      actions={
        <ActionButton
          title={translate('Add payment profile')}
          action={() => alert('Not implemented')}
          icon="fa fa-plus"
        />
      }
    />
  );
};

const TableOptions = {
  table: 'paymentProfiles',
  fetchData: createFetcher('payment-profiles'),
  mapPropsToFilter: props => ({ organization_uuid: props.customer.uuid }),
};

const mapStateToProps = state => ({
  customer: getCustomer(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const PaymentProfileList = enhance(TableComponent);
