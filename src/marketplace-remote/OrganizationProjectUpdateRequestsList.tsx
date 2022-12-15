import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { getCustomer } from '@waldur/workspace/selectors';

import { ProjectUpdateRequestActions } from './ProjectUpdateRequestActions';
import { ProjectUpdateRequestExpandable } from './ProjectUpdateRequestExpandable';

export const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Organization'),
          render: ({ row }) => row.customer_name,
        },
        { title: translate('Project'), render: ({ row }) => row.old_name },
        { title: translate('State'), render: ({ row }) => row.state },
        {
          title: translate('Created'),
          render: ({ row }) => formatDateTime(row.created),
          orderField: 'created',
        },
        {
          title: translate('Reviewed at'),
          render: ({ row }) =>
            row.reviewed_at ? formatDateTime(row.reviewed_at) : 'N/A',
        },
        {
          title: translate('Reviewed by'),
          render: ({ row }) => row.reviewed_by_full_name || 'N/A',
        },
      ]}
      title={translate('Project updates')}
      hoverableRow={({ row }) => (
        <ProjectUpdateRequestActions request={row} refreshList={props.fetch} />
      )}
      expandableRow={ProjectUpdateRequestExpandable}
      verboseName={translate('requests')}
    />
  );
};

const mapPropsToFilter = (props) => {
  const filter: Record<string, any> = {
    offering_customer_uuid: props.customer.uuid,
  };
  if (props?.filter?.state) {
    filter.state = props.filter.state?.map((choice) => choice.value);
  }
  if (props?.filter?.organization) {
    filter.customer_uuid = props.filter.organization?.uuid;
  }
  return filter;
};

const filterFormSelector = (state: RootState) =>
  getFormValues('OrganizationProjectUpdateRequestListFilter')(state);

const mapStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
  filter: filterFormSelector(state),
});

export const TableOptions = {
  table: 'marketplace-project-update-requests',
  fetchData: createFetcher('marketplace-project-update-requests'),
  mapPropsToFilter,
};

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const OrganizationProjectUpdateRequestsList = enhance(
  TableComponent,
) as React.ComponentType<any>;
