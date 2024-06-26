import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { getProject } from '@waldur/workspace/selectors';

interface OwnProps {
  tabSpec;
}

export const ProjectManage: FunctionComponent<OwnProps> = ({ tabSpec }) => {
  const project = useSelector(getProject);

  if (tabSpec) {
    return <tabSpec.component project={project} />;
  }
  return null;
};
