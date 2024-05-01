import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { useSelector } from 'react-redux';

import { PROJECT_MENU_EXCLUDE_STATES } from '@waldur/navigation/constants';
import { usePageHero } from '@waldur/navigation/context';
import { getProject } from '@waldur/workspace/selectors';

import { ProjectProfile } from './ProjectProfile';

const PageHero = ({ project }) => {
  const { state, params } = useCurrentStateAndParams();

  const hideHero =
    PROJECT_MENU_EXCLUDE_STATES.includes(state.name) || params.resource_uuid;

  if (hideHero) {
    return null;
  }

  return (
    <div className="container-fluid mb-8 mt-6">
      <ProjectProfile project={project} />
    </div>
  );
};

export const ProjectContainer = (props) => {
  const project = useSelector(getProject);

  usePageHero(project ? <PageHero project={project} /> : null);

  if (!project) {
    return null;
  }
  return <UIView {...props} />;
};
