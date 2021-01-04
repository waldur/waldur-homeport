import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { PAYMENT_PROFILES_TABLE } from '@waldur/customer/details/constants';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { ActionButton } from '@waldur/table/ActionButton';
import { getCustomer, isStaff, isSupport } from '@waldur/workspace/selectors';

import { PaymentProfileActions } from './PaymentProfileActions';

export const TableComponent: FunctionComponent<any> = (props) => {
  const router = useRouter();

  const tooltipAndDisabledAttributes = {
    disabled: props.isSupport && !props.isStaff,
    tooltip:
      props.isSupport && !props.isStaff
        ? translate('You must be staff to modify payment profiles')
        : null,
  };

  const columns = [
    {
      title: translate('Type'),
      render: ({ row }) => row.payment_type_display,
      orderField: 'payment_type',
    },
    {
      title: translate('Name'),
      render: ({ row }) => row.name,
      orderField: 'name',
    },
    {
      title: translate('Status'),
      render: ({ row }) => (
        <StateIndicator
          label={row.is_active ? translate('Enabled') : translate('Disabled')}
          variant={row.is_active ? 'success' : 'plain'}
        />
      ),
      orderField: 'is_active',
    },
    {
      title: translate('Actions'),
      render: ({ row }) => (
        <PaymentProfileActions
          profile={row}
          tooltipAndDisabledAttributes={tooltipAndDisabledAttributes}
        />
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
          action={() => router.stateService.go('payment-profile-create')}
          icon="fa fa-plus"
          {...tooltipAndDisabledAttributes}
        />
      }
    />
  );
};

const TableOptions = {
  table: PAYMENT_PROFILES_TABLE,
  fetchData: createFetcher('payment-profiles'),
  mapPropsToFilter: (props) => ({
    organization_uuid: props.customer.uuid,
    o: 'is_active',
  }),
};

const mapStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
  isStaff: isStaff(state),
  isSupport: isSupport(state),
});

const enhance = compose(
  connect(mapStateToProps, null),
  connectTable(TableOptions),
);

export const PaymentProfileList = enhance(TableComponent);
