import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { getProject } from '@waldur/workspace/selectors';

import { ProjectUpdateRequestExpandable } from './ProjectUpdateRequestExpandable';

export const TableComponent: FunctionComponent<any> = (props) => {
  useTitle(translate('Project updates'));
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Offering'),
          render: ({ row }) => row.offering_name,
        },
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
      expandableRow={ProjectUpdateRequestExpandable}
      verboseName={translate('requests')}
    />
  );
};

const mapPropsToFilter = (props) => ({
  project_uuid: props.project.uuid,
  state: props.filter?.state?.map((choice) => choice.value),
});

const filterFormSelector = (state: RootState) =>
  getFormValues('ProjectUpdateRequestListFilter')(state);

const mapStateToProps = (state: RootState) => ({
  project: getProject(state),
  filter: filterFormSelector(state),
});

const TableOptions = {
  table: 'marketplace-project-update-requests',
  fetchData: createFetcher('marketplace-project-update-requests'),
  mapPropsToFilter,
};

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const ProjectUpdateRequestsList = enhance(TableComponent);
