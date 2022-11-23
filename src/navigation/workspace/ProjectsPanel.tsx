import { useState, useCallback, useEffect, FunctionComponent } from 'react';
import { Col, ListGroup, Row, Stack, Tab, Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAsync, useEffectOnce } from 'react-use';

import { getList } from '@waldur/core/api';
import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { getCategories } from '@waldur/marketplace/common/api';
import { Category } from '@waldur/marketplace/types';
import { ProjectCounterResourceItem } from '@waldur/project/types';
import { loadProjectsResourceCounters } from '@waldur/project/utils';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { getProject } from '@waldur/workspace/selectors';
import { Customer, Project } from '@waldur/workspace/types';

import { PopupFlat } from './PopupFlat';
import { SearchBox } from './SearchBox';
import { useProjectFilter } from './utils';
import './ProjectsPanel.scss';

async function loadProjects(customer): Promise<Project[]> {
  return await getList('/projects/', {
    customer: customer.uuid,
    field: ['uuid', 'name', 'description', 'created', 'end_date'],
  });
}

const EmptyProjectsPlaceholder: FunctionComponent = () => (
  <p className="text-center text-danger">
    {translate('There are no projects yet for this organization.')}
  </p>
);

const SelectProjectButton = ({ project }) => (
  <Link
    className="btn btn-sm btn-secondary pull-right"
    state="project.dashboard"
    params={{ uuid: project.uuid }}
  >
    {translate('Select')}
  </Link>
);

const EmptyProjectListPlaceholder: FunctionComponent = () => (
  <tr className="text-center">
    <td colSpan={5}>{translate('There are no projects')}</td>
  </tr>
);

const getResourceIcon = (name) => {
  if (name === 'HPC') return 'fa fa-microchip';
  else if (name === 'AKKI') return 'fa fa-microchip';
  else if (name === 'Platform') return 'fa fa-window-maximize';
  else if (name === 'Private clouds') return 'fa fa-cloud';
  else if (name === 'Storage') return 'fa fa-database';
  else if (name === 'VMs') return 'fa fa-desktop';
  else return 'fa fa-server';
};
const getResourcesCount = (resources: ProjectCounterResourceItem[]) => {
  return resources.reduce((acc, item) => {
    return acc + Number(item.value);
  }, 0);
};
const PopoverResourceComponent = (props) => (
  <div className="resource-item">
    <i className={getResourceIcon(props.label)} />
    <div className="title">
      <span>{props.label}: </span>
      <span className="value">{props.value}</span>
    </div>
  </div>
);

const ProjectListItem = ({
  project,
  resources = [],
  projectLoading,
  resourcesLoading,
  onClick,
}: {
  project: Project;
  resources: ProjectCounterResourceItem[];
  projectLoading?: boolean;
  resourcesLoading?: boolean;
  onClick?: Function;
}) => {
  const resourceItems = resources
    ? resources.map((resource) => (
        <PopoverResourceComponent key={resource.label} {...resource} />
      ))
    : [];
  return (
    <tr>
      <td>
        <Stack direction="horizontal" gap={2}>
          <ImagePlaceholder
            width="32px"
            height="32px"
            backgroundColor="#e2e2e2"
          />
          <a
            className="text-dark ms-2"
            onClick={() => onClick && onClick(project)}
          >
            {project.name}
          </a>
        </Stack>
      </td>
      <td>
        {projectLoading ? (
          <i className="fa fa-spinner fa-spin" />
        ) : (
          formatDateTime(project.created)
        )}
      </td>
      <td>
        {projectLoading ? (
          <i className="fa fa-spinner fa-spin" />
        ) : project.end_date ? (
          formatDate(project.end_date)
        ) : (
          DASH_ESCAPE_CODE
        )}
      </td>
      <td>
        {resourcesLoading ? (
          <i className="fa fa-spinner fa-spin" />
        ) : (
          <>
            {getResourcesCount(resources) + ' '}
            {resourceItems.length ? (
              <PopupFlat
                groupId={'resources_' + project.uuid}
                items={resourceItems}
                placement="left"
                cols={3}
              >
                <i className="fa fa-info-circle" />
              </PopupFlat>
            ) : (
              ''
            )}
          </>
        )}
      </td>
      <td>
        <SelectProjectButton project={project} />
      </td>
    </tr>
  );
};

export const ProjectsPanel: FunctionComponent<{
  selectedOrganization: Customer;
}> = ({ selectedOrganization }) => {
  const currentProject = useSelector(getProject);
  const [selectedProject, selectProject] = useState<Project>(currentProject);
  const [categories, setCategories] = useState<Category[]>([]);
  useEffectOnce(() => {
    (async () => {
      const categoriesRes = await getCategories({
        params: { field: ['uuid', 'title'] },
      });
      setCategories(categoriesRes);
    })();
  });
  const { loading: projectsLoading, value: projects } = useAsync(
    () => loadProjects(selectedOrganization),
    [selectedOrganization],
  );
  const { loading: resourcesLoading, value: projectsResources } = useAsync(
    () => loadProjectsResourceCounters(projects, categories),
    [projects, categories],
  );

  const { filter, setFilter, filteredProjects } = useProjectFilter(
    projects || selectedOrganization?.projects,
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
    <>
      <Row className="mb-4">
        <Col sm={12} md={6} lg={8}>
          <Tab.Container id="list-group-tabs-projects" defaultActiveKey={1}>
            <ListGroup horizontal={true} className="list-group-metro">
              <ListGroup.Item action eventKey={1}>
                {translate('Recent')}
              </ListGroup.Item>
              <ListGroup.Item action eventKey={2}>
                {translate('Starred')}
              </ListGroup.Item>
              <ListGroup.Item action eventKey={3}>
                {translate('All projects')}
              </ListGroup.Item>
            </ListGroup>
          </Tab.Container>
        </Col>
        <Col sm={12} md={6} lg={4}>
          <SearchBox
            groupId="project-search-box"
            value={filter}
            onChange={setFilter}
            placeholder={translate('Filter projects')}
            className="pull-right"
          />
        </Col>
      </Row>
      {selectedOrganization && selectedOrganization.projects.length == 0 ? (
        <EmptyProjectsPlaceholder />
      ) : (
        <>
          <Table className="table-metro projects-table" responsive hover>
            <thead>
              <tr>
                <th>{translate('Project')}</th>
                <th>{translate('Created')}</th>
                <th>{translate('End date')}</th>
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
                    projectLoading={projectsLoading}
                    resources={
                      projectsResources ? projectsResources[project.uuid] : []
                    }
                    resourcesLoading={resourcesLoading}
                    onClick={selectProject}
                  />
                ))
              )}
            </tbody>
          </Table>
        </>
      )}
    </>
  );
};
