import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ResourceMultiSelectAction } from '@waldur/marketplace/resources/mass-actions/ResourceMultiSelectAction';
import { CategoryColumn } from '@waldur/marketplace/types';
import { isVisible } from '@waldur/store/config';
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
  importVisible: boolean;
  filter: any;
}

interface OwnProps {
  category_uuid: string;
  columns: CategoryColumn[];
}

export const TableComponent: FunctionComponent<any> = (props) => {
  const columns: any[] = [
    {
      title: translate('Name'),
      render: ResourceNameField,
      orderField: 'name',
    },
    {
      title: translate('Offering'),
      render: ({ row }: FieldProps) => row.offering_name,
    },
  ];

  props.columns.map((column: CategoryColumn) => {
    columns.push({
      title: column.title,
      render: ({ row }) => CategoryColumnField({ row, column }),
    });
  });
  columns.push(
    {
      title: translate('State'),
      render: ResourceStateField,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
    },
  );

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
      hoverableRow={({ row }) => (
        <ResourceActionsButton row={row} refetch={props.fetch} />
      )}
      actions={tableActions}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hasQuery={true}
      showPageSizeSelector={true}
      expandableRow={ExpandableResourceSummary}
      enableMultiSelect={true}
      multiSelectActions={ResourceMultiSelectAction}
    />
  );
};

const mapPropsToFilter = (props: StateProps & OwnProps) => {
  const filter: Record<string, any> = {};
  if (props.project) {
    filter.project_uuid = props.project.uuid;
  }
  if (props.category_uuid) {
    filter.category_uuid = props.category_uuid;
  }
  if (props.filter?.offering) {
    filter.offering_uuid = props.filter.offering.uuid;
  }
  if (props.filter?.runtime_state) {
    filter.runtime_state = props.filter.runtime_state.value;
  }
  if (props.filter?.state) {
    filter.state = props.filter.state.map((option) => option.value);
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
  importVisible: isVisible(state, 'marketplace.import_resources'),
  filter: getFormValues('ProjectResourcesFilter')(state),
});

const enhance = compose(
  connect<StateProps, {}, OwnProps>(mapStateToProps),
  connectTable(TableOptions),
);

export const ProjectResourcesList = enhance(
  TableComponent,
) as React.ComponentType<any>;
