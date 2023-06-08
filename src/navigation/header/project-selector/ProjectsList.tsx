import classNames from 'classnames';
import { useState, useCallback, FunctionComponent, useEffect } from 'react';
import { Stack } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { MenuComponent } from '@waldur/metronic/assets/ts/components';
import { BaseList } from '@waldur/navigation/workspace/context-selector/BaseList';
import { highlightMatch } from '@waldur/navigation/workspace/highlightMatch';
import { getProject } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import { ItemIcon } from './ItemIcon';

const EmptyProjectsPlaceholder: FunctionComponent = () => (
  <p className="text-center text-danger my-10 mx-4">
    {translate('There are no projects yet for this organization.')}
  </p>
);

const EmptyProjectListPlaceholder: FunctionComponent = () => (
  <p className="text-center ellipsis my-10 mx-4">
    {translate('There are no projects.')}
  </p>
);

const ProjectListItem = ({ item, filter, loading }) => {
  return (
    <>
      <Stack direction="horizontal" gap={5} title={item.name}>
        <ItemIcon item={item} />
        <div className="overflow-hidden">
          <p className="title ellipsis mb-0">
            {filter ? highlightMatch(item.name, filter) : item.name}
          </p>
          {item.resource_count > 0 ? (
            <small className="subtitle">
              {item.resource_count}{' '}
              {item.resource_count > 1
                ? translate('Resources')
                : translate('Resource')}
            </small>
          ) : (
            <i className="text-muted subtitle">{translate('No resource')}</i>
          )}
        </div>
        <span className="ms-auto">{loading && <LoadingSpinnerIcon />}</span>
      </Stack>
      <div className="actions">
        <div className="action-item">
          <Link
            className="text-decoration-underline"
            state="project.dashboard"
            params={{ uuid: item.uuid }}
            onClick={(e) => {
              e.stopPropagation();
              MenuComponent.hideDropdowns(undefined);
            }}
          >
            {translate('Project dashboard')}
          </Link>
        </div>
        <div className="action-item">
          <Link
            className="text-decoration-underline"
            state="marketplace-project-resources-all"
            params={{ uuid: item.uuid }}
            onClick={(e) => {
              e.stopPropagation();
              MenuComponent.hideDropdowns(undefined);
            }}
          >
            {translate('See resources')}
          </Link>
        </div>
      </div>
    </>
  );
};

export const ProjectsList: FunctionComponent<{
  projects: Project[];
  onSelect(project: Project): void;
  isDisabled?: boolean;
  filter: string;
  loadingUuid: string;
}> = ({ projects, onSelect, isDisabled, filter, loadingUuid }) => {
  const currentProject = useSelector(getProject);
  const [selectedProject, selectProject] = useState<Project>(currentProject);

  const handleProjectClick = useCallback(
    (project: Project) => {
      selectProject(project);
      onSelect(project);
    },
    [onSelect],
  );

  useEffect(() => {
    selectProject(currentProject);
  }, [currentProject, selectProject]);

  return (
    <div className={classNames({ disabled: isDisabled }, 'project-listing')}>
      {projects?.length > 0 ? (
        <BaseList
          style={{
            height: projects.length * 75 + 'px',
            maxHeight: 'calc(100vh - 100px)',
          }}
          items={projects}
          selectedItem={selectedProject}
          selectItem={handleProjectClick}
          EmptyPlaceholder={EmptyProjectListPlaceholder}
          ItemComponent={ProjectListItem}
          filter={filter}
          loadingUuid={loadingUuid}
        />
      ) : (
        <EmptyProjectsPlaceholder />
      )}
    </div>
  );
};
