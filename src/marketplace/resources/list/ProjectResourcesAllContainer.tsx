import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { ProjectResourcesAllFilter } from './ProjectResourcesAllFilter';
import { ProjectResourcesAllList } from './ProjectResourcesAllList';

export const ProjectResourcesAllContainer: FunctionComponent = () => {
  useTitle(translate('All resources'));
  return <ProjectResourcesAllList filters={<ProjectResourcesAllFilter />} />;
};
