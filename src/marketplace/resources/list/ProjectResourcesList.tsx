import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { RESOURCE_STATES } from '@waldur/marketplace/resources/list/constants';
import { CategoryColumn } from '@waldur/marketplace/types';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { getProject } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import { ResourceImportButton } from '../import/ResourceImportButton';
import { Resource } from '../types';

import { CategoryColumnField } from './CategoryColumnField';
import { CreateResourceButton } from './CreateResourceButton';
import { EmptyResourcesListPlaceholder } from './EmptyResourcesListPlaceholder';
import { ExpandableResourceSummary } from './ExpandableResourceSummary';
import { ResourceActionsButton } from './ResourceActionsButton';
import { ResourceNameField } from './ResourceNameField';
import { ResourceStateField } from './ResourceStateField';

interface FieldProps {
  row: Resource;
}

interface StateProps {
  project: Project;
  filter: any;
}

interface OwnProps {
  category_uuid: string;
  columns: CategoryColumn[];
}

export const TableComponent: FunctionComponent<any> = (props) => {
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
    render: ({ row }) => (
      <ResourceActionsButton row={row} refreshList={props.fetch} />
    ),
  });

  const tableActions = (
    <>
      {ENV.FEATURES.MARKETPLACE.IMPORT_RESOURCES && (
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
      expandableRow={ExpandableResourceSummary}
    />
  );
};

const mapPropsToFilter = (props: StateProps & OwnProps) => {
  const filter: Record<string, any> = {
    state: RESOURCE_STATES,
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
  queryField: 'query',
};

const mapStateToProps = (state: RootState) => ({
  project: getProject(state),
  filter: getFormValues('ProjectResourcesFilter')(state),
});

const enhance = compose(
  connect<StateProps, {}, OwnProps>(mapStateToProps),
  connectTable(TableOptions),
);

export const ProjectResourcesList = enhance(TableComponent);
