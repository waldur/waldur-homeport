import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { RESOURCE_STATES } from '@waldur/marketplace/resources/list/constants';
import { ResourceNameField } from '@waldur/marketplace/resources/list/ResourceNameField';
import { ResourceStateField } from '@waldur/marketplace/resources/list/ResourceStateField';
import { Resource } from '@waldur/marketplace/resources/types';
import { PROJECT_RESOURCES_FILTER_FORM_ID } from '@waldur/project/constants';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { getProject } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

interface FieldProps {
  row: Resource;
}

export const TableComponent: FunctionComponent<any> = (props) => {
  const columns = [
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
      render: ({ row }: FieldProps) => formatDateTime(row.created),
      orderField: 'created',
    },
    {
      title: translate('State'),
      render: ResourceStateField,
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Resources')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      showPageSizeSelector={true}
    />
  );
};

const mapPropsToFilter = (props) => {
  const filter: Record<string, string | string[]> = {
    state: RESOURCE_STATES,
  };
  if (props.project) {
    filter.project_uuid = props.project.uuid;
  }
  if (props.filter) {
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
  table: 'ProjectResourcesList',
  fetchData: createFetcher('marketplace-resources'),
  mapPropsToFilter,
};

const mapStateToProps = (state: RootState) => ({
  project: getProject(state),
  filter: getFormValues(PROJECT_RESOURCES_FILTER_FORM_ID)(state),
});

interface StateProps {
  project: Project;
}

const enhance = compose(
  connect<StateProps>(mapStateToProps),
  connectTable(TableOptions),
);

export const ProjectResourcesList = enhance(TableComponent);
