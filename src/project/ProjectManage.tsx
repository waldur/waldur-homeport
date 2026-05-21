import { FunctionComponent } from 'react';

import { useProject } from '@/workspace/hooks';

interface OwnProps {
  tabSpec;
}

export const ProjectManage: FunctionComponent<OwnProps> = ({ tabSpec }) => {
  const project = useProject();

  if (tabSpec) {
    return <tabSpec.component project={project} />;
  }
  return null;
};
