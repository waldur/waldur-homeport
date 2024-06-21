import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { IBreadcrumbItem } from '@waldur/navigation/types';
import { getProject } from '@waldur/workspace/selectors';

import { ProjectBreadcrumbPopover } from './ProjectBreadcrumbPopover';
import { ProjectProfile } from './ProjectProfile';

const PageHero = ({ project }) => {
  return (
    <div className="container-fluid mb-8 mt-6">
      <ProjectProfile project={project} />
    </div>
  );
};

const ProjectContainerWithHero = (props) => {
  const project = useSelector(getProject);

  usePageHero(<PageHero project={project} />);

  const breadcrumbItems = useMemo<IBreadcrumbItem[]>(
    () => [
      {
        key: 'organizations',
        text: translate('Organizations'),
        to: 'organizations',
      },
      {
        key: 'organization.dashboard',
        text: project.customer_name,
        to: 'organization.dashboard',
        params: { uuid: project.customer_uuid },
        ellipsis: 'md',
      },
      {
        key: 'organization.projects',
        text: translate('Projects'),
        to: 'organization.projects',
        params: { uuid: project.customer_uuid },
        ellipsis: 'xl',
      },
      {
        key: 'project',
        text: project.name,
        dropdown: <ProjectBreadcrumbPopover project={project} />,
        truncate: true,
        active: true,
      },
    ],
    [project],
  );
  useBreadcrumbs(breadcrumbItems);

  return <UIView {...props} />;
};

export const ProjectContainer = (props) => {
  const { state } = useCurrentStateAndParams();
  const project = useSelector(getProject);

  if (!project) {
    return null;
  }

  if (state.data?.skipHero) {
    return <UIView {...props} />;
  }
  return <ProjectContainerWithHero {...props} />;
};
