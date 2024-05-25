import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { UserResourcesAllList } from '@waldur/marketplace/resources/list/UserResourcesAllList';
import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';
import { getProject, getUser } from '@waldur/workspace/selectors';

import { ProjectDashboardCostLimits } from './ProjectDashboardCostLimits';
import { ProjectEventsView } from './ProjectEventsList';

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
      {!shouldConcealPrices && <ProjectDashboardCostLimits project={project} />}
      <UserResourcesAllList
        initialPageSize={5}
        className="mb-6"
        hasProjectFilter={false}
      />
      <ProjectEventsView />
    </>
  );
};
