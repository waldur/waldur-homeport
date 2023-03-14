import { UIView } from '@uirouter/react';
import { useSelector } from 'react-redux';

import { getProject } from '@waldur/workspace/selectors';

export const ProjectContainer = (props) => {
  const project = useSelector(getProject);
  if (!project) {
    return null;
  }
  return <UIView {...props} />;
};
