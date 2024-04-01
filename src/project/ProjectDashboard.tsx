import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { ProjectResourcesAllList } from '@waldur/marketplace/resources/list/ProjectResourcesAllList';
import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';
import { getProject, getUser } from '@waldur/workspace/selectors';

import { ProjectDashboardCostLimits } from './ProjectDashboardCostLimits';
import { ProjectEventsView } from './ProjectEventsList';
import { ProjectProfile } from './ProjectProfile';

export const ProjectDashboard: FunctionComponent<{}> = () => {
  const shouldConcealPrices = useSelector((state: RootState) =>
    isVisible(state, MarketplaceFeatures.conceal_prices),
  );

  const user = useSelector(getUser);
  const project = useSelector(getProject);

  if (!project) {
    return null;
  }
  if (!user) {
    return null;
  }
  return (
    <>
      <ProjectProfile project={project} />
      {!shouldConcealPrices && <ProjectDashboardCostLimits project={project} />}
      <ProjectResourcesAllList initialPageSize={5} className="mb-6" />
      <ProjectEventsView initialPageSize={5} />
    </>
  );
};
