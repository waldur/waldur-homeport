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
import { useAsync, useEffectOnce } from 'react-use';

import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { getCategories, getProjectList } from '@waldur/marketplace/common/api';
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
  return (
    await getProjectList({
      customer: customer.uuid,
      field: ['uuid', 'name', 'description', 'created', 'end_date'],
    })
  ).options;
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

const PopoverResourceComponent = (props) => (
  <p>
    {props.label}: {props.value}
  </p>
);

const ProjectListItem = ({
  project,
  resources,
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
  const resourceItems = resources.map((resource) => (
    <PopoverResourceComponent key={resource.label} {...resource} />
  ));
  return (
    <tr>
      <td>
        <div className="project-list-item">
          <img src="https://via.placeholder.com/32/E2E2E2/FFFFFF?text=+" />
          <a
            className="title m-l-md"
            onClick={() => onClick && onClick(project)}
          >
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
            {resources?.length + ' '}
            <PopupFlat
              groupId={'resources_' + project.uuid}
              items={resourceItems}
              placement="left"
              cols={3}
            >
              <i className="fa fa-info-circle" />
            </PopupFlat>
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
                  <th>{translate('Created')}</th>
                  <th>{translate('End Date')}</th>
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
      </Col>
    </Row>
  );
};
