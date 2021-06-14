import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';
import { getUser } from '@waldur/workspace/selectors';

import { FlowActions } from './FlowActions';
import { FlowCreateButton } from './FlowCreateButton';
import { FlowExpandableRow } from './FlowExpandableRow';
import { RequestStateIndicator } from './RequestStateIndicator';
import { flowFilterFormSelector } from './utils';

export const TableComponent: FunctionComponent<any> = (props) => {
  useTitle(translate('Resource creation flows'));
  const columns = [
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
    },
    {
      title: translate('Organization'),
      render: ({ row }) => (
        <>{row.customer?.name || row.customer_create_request?.name}</>
      ),
    },
    {
      title: translate('Project'),
      render: ({ row }) => <>{row.project_create_request.name}</>,
    },
    {
      title: translate('Resource'),
      render: ({ row }) => <>{row.resource_create_request.name}</>,
    },
    {
      title: translate('Offering'),
      render: ({ row }) => <>{row.resource_create_request.offering_name}</>,
    },
    {
      title: translate('Provider'),
      render: ({ row }) => <>{row.resource_create_request.provider_name}</>,
    },
    {
      title: translate('State'),
      render: RequestStateIndicator,
    },
    {
      title: translate('Actions'),
      render: ({ row }) => <FlowActions flow={row} refreshList={props.fetch} />,
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('resource creation flows')}
      showPageSizeSelector={true}
      actions={<FlowCreateButton />}
      expandableRow={FlowExpandableRow}
    />
  );
};

export const TableOptions: TableOptionsType = {
  table: 'MarketplaceFlowsList',
  fetchData: createFetcher('marketplace-resource-creation-flows'),
  mapPropsToFilter: (props) => ({
    user_uuid: props.user?.uuid,
    state: props.filter.state?.map((choice) => choice.value),
  }),
};

const mapStateToProps = (state: RootState) => ({
  user: getUser(state),
  filter: flowFilterFormSelector(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const FlowsList = enhance(TableComponent);
