import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  FunctionComponent,
} from 'react';
import {
  ButtonToolbar,
  Col,
  Row,
  Table,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import {
  getProject,
  getUser,
  checkCustomerUser,
} from '@waldur/workspace/selectors';
import { Customer, Project } from '@waldur/workspace/types';

import { SearchBox } from './SearchBox';
import { useProjectFilter } from './utils';
import './ProjectsPanel.scss';

const CreateProjectButton: FunctionComponent<{
  selectedOrganization: Customer;
}> = ({ selectedOrganization }) => {
  const user = useSelector(getUser);
  const canCreate = useMemo(
    () => checkCustomerUser(selectedOrganization, user),
    [selectedOrganization, user],
  );
  if (!selectedOrganization || !canCreate) {
    return null;
  }
  return (
    <Link
      className="pull-right btn btn-sm btn-metro"
      state="organization.createProject"
      params={{
        uuid: selectedOrganization.uuid,
      }}
    >
      <i className="fa fa-plus" /> {translate('Add new project')}
    </Link>
  );
};

const EmptyProjectsPlaceholder: FunctionComponent = () => (
  <p className="text-center text-danger">
    {translate('There are no projects yet for this organization.')}
  </p>
);

const ProjectsHeader: FunctionComponent<{
  selectedOrganization?: Customer;
}> = ({ selectedOrganization }) => (
  <h3 className="m-b-md">
    {translate('Projects ({count})', {
      count: selectedOrganization?.projects?.length || 0,
    })}
  </h3>
);

const SelectProjectButton = ({ project }) => (
  <Link
    className="btn btn-xs btn-metro pull-right"
    state="project.details"
    params={{ uuid: project.uuid }}
  >
    {translate('Select')}
  </Link>
);

const EmptyProjectListPlaceholder: FunctionComponent = () => (
  <tr className="text-center">
    <td colSpan={5}>{translate('There are no projects matching filter.')}</td>
  </tr>
);

const ProjectListItem = ({ project, onClick }) => (
  <tr>
    <td>
      <div className="project-list-item">
        <img src="https://via.placeholder.com/32/E2E2E2/FFFFFF?text=+" />
        <a className="title m-l-md" onClick={() => onClick(project)}>
          {project.name}
        </a>
      </div>
    </td>
    <td>{'21.01.22' /*formatDateTime(project.created)*/}</td>
    <td>
      {
        '21.01.22' /*project.end_date ? formatDate(project.end_date) : DASH_ESCAPE_CODE*/
      }
    </td>
    <td>{'2'}</td>
    <td>
      <SelectProjectButton project={project} />
    </td>
  </tr>
);

export const ProjectsPanel: FunctionComponent<{
  selectedOrganization: Customer;
}> = ({ selectedOrganization }) => {
  const currentProject = useSelector(getProject);
  const [selectedProject, selectProject] = useState<Project>(currentProject);

  const { filter, setFilter, filteredProjects } = useProjectFilter(
    selectedOrganization?.projects,
  );

  const selectFirstProject = useCallback(() => {
    if (
      !selectedProject &&
      selectedOrganization &&
      selectedOrganization.projects.length > 0
    ) {
      selectProject(selectedOrganization.projects[0]);
    }
  }, [selectedOrganization, selectedProject]);

  useEffect(selectFirstProject, [selectedOrganization]);

  return (
    <Row>
      <Col xs={12}>
        <CreateProjectButton selectedOrganization={selectedOrganization} />
        <ProjectsHeader selectedOrganization={selectedOrganization} />
        <SearchBox
          groupId="project-search-box"
          value={filter}
          onChange={setFilter}
          placeholder={translate('Filter projects')}
          className="pull-right"
        />
        {selectedOrganization && selectedOrganization.projects.length == 0 ? (
          <EmptyProjectsPlaceholder />
        ) : (
          <>
            <ButtonToolbar>
              <ToggleButtonGroup
                className="btn-group-metro"
                type="radio"
                name="tabs"
                defaultValue={1}
              >
                <ToggleButton value={1}>Recent</ToggleButton>
                <ToggleButton value={2}>Starred</ToggleButton>
                <ToggleButton value={3}>All Projects</ToggleButton>
              </ToggleButtonGroup>
            </ButtonToolbar>
            <Table className="table-metro" responsive hover>
              <thead>
                <tr>
                  <th>{translate('Project')}</th>
                  <th>{translate('Last Modified')}</th>
                  <th>{translate('Created')}</th>
                  <th>{translate('Resources')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <EmptyProjectListPlaceholder />
                ) : (
                  filteredProjects.map((project) => (
                    <ProjectListItem
                      key={project.uuid}
                      project={project}
                      onClick={selectProject}
                    />
                  ))
                )}
              </tbody>
            </Table>
          </>
        )}
      </Col>
    </Row>
  );
};
