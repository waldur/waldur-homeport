import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { CategoryColumn } from '@waldur/marketplace/types';
import { isVisible } from '@waldur/store/config';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { getProject } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import { ResourceImportButton } from '../import/ResourceImportButton';
import { Resource } from '../types';

import { CategoryColumnField } from './CategoryColumnField';
import { CreateResourceButton } from './CreateResourceButton';
import { EmptyResourcesListPlaceholder } from './EmptyResourcesListPlaceholder';
import { ResourceActionsButton } from './ResourceActionsButton';
import { ResourceNameField } from './ResourceNameField';
import { ResourceStateField } from './ResourceStateField';

interface FieldProps {
  row: Resource;
}

interface StateProps {
  project: Project;
  importVisible: boolean;
  filter: any;
}

interface OwnProps {
  category_uuid: string;
  columns: CategoryColumn[];
}

export const TableComponent = (props) => {
  const columns = [
    {
      title: translate('Name'),
      render: ResourceNameField,
      orderField: 'name',
    },
    {
      title: translate('Offering'),
      render: ({ row }: FieldProps) => row.offering_name,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
    },
    {
      title: translate('State'),
      render: ResourceStateField,
    },
  ];

  props.columns.map((column: CategoryColumn) => {
    columns.push({
      title: column.title,
      render: ({ row }) => CategoryColumnField({ row, column }),
    });
  });

  columns.push({
    title: translate('Actions'),
    render: ResourceActionsButton,
  });

  const tableActions = (
    <>
      {props.importVisible && (
        <ResourceImportButton
          category_uuid={props.category_uuid}
          project_uuid={props.project && props.project.uuid}
        />
      )}
      <CreateResourceButton category_uuid={props.category_uuid} />
    </>
  );

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Resources')}
      placeholderComponent={<EmptyResourcesListPlaceholder />}
      actions={tableActions}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hasQuery={true}
      showPageSizeSelector={true}
    />
  );
};

const mapPropsToFilter = (props: StateProps & OwnProps) => {
  const filter: Record<string, any> = {
    state: ['Creating', 'OK', 'Erred', 'Updating', 'Terminating'],
  };
  if (props.project) {
    filter.project_uuid = props.project.uuid;
  }
  if (props.category_uuid) {
    filter.category_uuid = props.category_uuid;
  }
  if (props.filter?.offering) {
    filter.offering_uuid = props.filter.offering.uuid;
  }
  return filter;
};

const TableOptions = {
  table: 'ProjectResourcesList',
  mapPropsToTableId: (props) => [props.project.uuid, props.category_uuid],
  fetchData: createFetcher('marketplace-resources'),
  mapPropsToFilter,
  queryField: 'name',
};

const mapStateToProps = (state) => ({
  project: getProject(state),
  importVisible: isVisible(state, 'import'),
  filter: getFormValues('ProjectResourcesFilter')(state),
});

const enhance = compose(
  connect<StateProps, {}, OwnProps>(mapStateToProps),
  connectTable(TableOptions),
);

export const ProjectResourcesList = enhance(TableComponent);
