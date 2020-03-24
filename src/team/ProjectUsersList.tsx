import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { getProject } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

import { GravatarField } from './GravatarField';
import { ProjectUserAddButton } from './ProjectUserAddButton';
import { ProjectUserDeleteButton } from './ProjectUserDeleteButton';
import { ProjectUserDetailsButton } from './ProjectUserDetailsButton';

const ProjectUserActions = ({ row }) => (
  <>
    <ProjectUserDetailsButton row={row} />
    <ProjectUserDeleteButton row={row} />
  </>
);

const TableComponent = props => {
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Member'),
          render: GravatarField,
        },
        {
          title: translate('E-mail'),
          render: ({ row }) => <>{row.email}</>,
        },
        {
          title: translate('Role in project'),
          render: ({ row }) => <>{ENV.roles[row.role]}</>,
        },
        {
          title: translate('Role in project'),
          render: ProjectUserActions,
        },
      ]}
      actions={<ProjectUserAddButton />}
      verboseName={translate('team members')}
    />
  );
};

const generateUrl = request =>
  `${ENV.apiEndpoint}api/projects/${request.filter.project_uuid}/users/?o=concatenated_name`;

const TableOptions = {
  table: 'project-users',
  fetchData: createFetcher('projects', generateUrl),
  mapPropsToFilter: props => ({
    project_uuid: props.project.uuid,
  }),
};

const conenctor = compose(
  connect((state: OuterState) => ({ project: getProject(state) })),
  connectTable(TableOptions),
);

const ProjectUsersList = conenctor(TableComponent);

export default connectAngularComponent(ProjectUsersList);
