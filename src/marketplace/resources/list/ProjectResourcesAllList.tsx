import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { PROJECT_RESOURCES_ALL_FILTER_FORM_ID } from '@waldur/marketplace/resources/list/constants';
import { ResourceMultiSelectAction } from '@waldur/marketplace/resources/mass-actions/ResourceMultiSelectAction';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { getProject } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import { Resource } from '../types';

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
  filter;
}

export const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ResourceNameField,
          orderField: 'name',
        },
        {
          title: translate('Category'),
          render: ({ row }: FieldProps) => row.category_title,
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
      ]}
      verboseName={translate('Resources')}
      placeholderComponent={<EmptyResourcesListPlaceholder />}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hoverableRow={({ row }) => (
        <ResourceActionsButton row={row} refetch={props.fetch} />
      )}
      hasQuery={true}
      showPageSizeSelector={true}
      expandableRow={ExpandableResourceSummary}
      enableMultiSelect={true}
      multiSelectActions={ResourceMultiSelectAction}
    />
  );
};

const mapPropsToFilter = (props: StateProps) => {
  const filter: Record<string, any> = {};
  if (props.project) {
    filter.project_uuid = props.project.uuid;
  }
  if (props.filter) {
    if (props.filter.offering) {
      filter.offering_uuid = props.filter.offering.uuid;
    }
    if (props.filter.state) {
      filter.state = props.filter.state.value;
    }
    if (props.filter.category) {
      filter.category_uuid = props.filter.category.uuid;
    }
  }
  return filter;
};

const TableOptions = {
  table: 'ProjectResourcesAllList',
  mapPropsToTableId: (props) => [props.project.uuid],
  fetchData: createFetcher('marketplace-resources'),
  mapPropsToFilter,
  queryField: 'query',
};

const mapStateToProps = (state: RootState) => ({
  project: getProject(state),
  filter: getFormValues(PROJECT_RESOURCES_ALL_FILTER_FORM_ID)(state),
});

const enhance = compose(
  connect<StateProps, {}, {}>(mapStateToProps),
  connectTable(TableOptions),
);

export const ProjectResourcesAllList = enhance(
  TableComponent,
) as React.ComponentType<any>;
