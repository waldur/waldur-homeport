import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { CategoryColumn } from '@waldur/marketplace/types';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { getProject } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import { OrderItemLink } from './OrderItemLink';
import { OrderItemResponse } from './types';

const NameField = ({ row }: {row: OrderItemResponse}) => {
  const label = row.attributes.name || row.offering_name;
  if (row.resource_type && row.resource_uuid) {
    return (
      <OrderItemLink item={row}>
        {label}
      </OrderItemLink>
    );
  } else {
    return label;
  }
};

export const TableComponent = props => {
  const columns = [
    {
      title: translate('Name'),
      render: NameField,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
    },
    {
      title: translate('State'),
      render: ({ row }) => row.state,
    },
  ];

  props.columns.map((column: CategoryColumn) => {
    columns.push({
      title: column.title,
      render: ({ row }) => row.attributes[column.attribute] || 'N/A',
    });
  });

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Resources')}
    />
  );
};

const TableOptions = {
  table: 'ProjectResourcesList',
  fetchData: createFetcher('marketplace-resources'),
  mapPropsToFilter: props => ({
    project_uuid: props.project.uuid,
    category_uuid: props.category_uuid,
  }),
};

const mapStateToProps = state => ({
  project: getProject(state),
});

interface StateProps {
  project: Project;
}

interface OwnProps {
  category_uuid: string;
  columns: CategoryColumn[];
}

const enhance = compose(
  connect<StateProps, {}, OwnProps>(mapStateToProps),
  connectTable(TableOptions),
);

export const ProjectResourcesList = enhance(TableComponent);
