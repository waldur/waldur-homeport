import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { useSelector } from 'react-redux';

import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { getProject } from '@waldur/workspace/selectors';

import { ProjectBreadcrumbs } from './ProjectBreadcrumbs';
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

  useBreadcrumbs(<ProjectBreadcrumbs project={project} />);

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
