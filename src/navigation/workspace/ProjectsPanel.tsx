import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  FunctionComponent,
} from 'react';
import { Col, ListGroup, Row, Stack, Tab, Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAsync, useEffectOnce } from 'react-use';

import { getList } from '@waldur/core/api';
import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { getCategories } from '@waldur/marketplace/common/api';
import { Category } from '@waldur/marketplace/types';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import {
  getProject,
  getUser,
  checkCustomerUser,
} from '@waldur/workspace/selectors';
import { Customer, Project } from '@waldur/workspace/types';

import { getProjectCounters } from './api';
import { PopupFlat } from './PopupFlat';
import { SearchBox } from './SearchBox';
import { useProjectFilter } from './utils';
import './ProjectsPanel.scss';

interface ResourceItem {
  label: string;
  value: number | string;
}

const parseCounters = (
  categories: Category[],
  counters: object,
): ResourceItem[] => {
  return categories
    .map((category) => ({
      label: category.title,
      value: counters[`marketplace_category_${category.uuid}`],
    }))
    .filter((row) => row.value);
};

const combineRows = (rows: ResourceItem[]): ResourceItem[] =>
  rows
    .filter((item) => item.value)
    .sort((a, b) => a.label.localeCompare(b.label));

async function loadProjects(customer): Promise<Project[]> {
  return await getList('/projects/', {
    customer: customer.uuid,
    field: ['uuid', 'name', 'description', 'created', 'end_date'],
  });
}
async function loadResources(
  projects: Project[],
  categories,
): Promise<Record<'string', ResourceItem[]>> {
  const result = {};
  for (const project of projects) {
    const counters = await getProjectCounters(project.uuid);
    const counterRows = parseCounters(categories, counters);
    result[project.uuid] = combineRows(counterRows);
  }
  return result as Record<'string', ResourceItem[]>;
}

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
      className="btn btn-sm btn-metro ms-auto"
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
  <h5>
    {translate('Projects ({count})', {
      count: selectedOrganization?.projects?.length || 0,
    })}
  </h5>
);

const SelectProjectButton = ({ project }) => (
  <Link
    className="btn btn-sm btn-metro pull-right"
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

const getResourceIcon = (name) => {
  if (name === 'HPC') return 'fa fa-microchip';
  else if (name === 'AKKI') return 'fa fa-microchip';
  else if (name === 'Platform') return 'fa fa-window-maximize';
  else if (name === 'Private clouds') return 'fa fa-cloud';
  else if (name === 'Storage') return 'fa fa-database';
  else if (name === 'VMs') return 'fa fa-desktop';
  else return 'fa fa-server';
};
const getResourcesCount = (resources: ResourceItem[]) => {
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
  resources: ResourceItem[];
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
        <div className="project-list-item">
          <span className="image-placeholder"></span>
          <a className="title ms-2" onClick={() => onClick && onClick(project)}>
            {project.name}
          </a>
        </div>
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
    () => loadResources(projects, categories),
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
      <Stack direction="horizontal" gap={2} className="mb-4">
        <ProjectsHeader selectedOrganization={selectedOrganization} />
        <CreateProjectButton selectedOrganization={selectedOrganization} />
      </Stack>
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
