import classNames from 'classnames';
import { useState, useCallback, FunctionComponent } from 'react';
import { Col, Stack } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { truncate } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { getProject } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import { BaseList } from './BaseList';

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

const ProjectListItem = ({ item }) => (
  <Stack direction="horizontal" gap={4}>
    <ImagePlaceholder width="36px" height="36px" backgroundColor="#e2e2e2" />
    <span className="title ellipsis">{truncate(item.name, 40)}</span>
  </Stack>
);

export const ProjectsPanel: FunctionComponent<{
  projects: Project[];
  onSelect(project: Project): void;
  isDisabled: boolean;
}> = ({ projects, onSelect, isDisabled }) => {
  const currentProject = useSelector(getProject);
  const [selectedProject, selectProject] = useState<Project>(currentProject);

  const handleProjectClick = useCallback(
    (project: Project) => {
      selectProject(project);
      onSelect(project);
    },
    [onSelect],
  );

  return (
    <Col
      xs={7}
      className={classNames({ disabled: isDisabled }, 'project-listing')}
    >
      <div className="py-1 px-4 border-gray-300 border-bottom">
        <span className="fw-bold fs-7 text-decoration-underline text-muted">
          {translate('Project')}
        </span>
      </div>
      {projects?.length > 0 ? (
        <BaseList
          items={projects}
          selectedItem={selectedProject}
          selectItem={handleProjectClick}
          EmptyPlaceholder={EmptyProjectListPlaceholder}
          ItemComponent={ProjectListItem}
        />
      ) : (
        <EmptyProjectsPlaceholder />
      )}
    </Col>
  );
};
