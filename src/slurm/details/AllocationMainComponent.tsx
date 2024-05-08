import { useContext, useEffect } from 'react';

import { isFeatureVisible } from '@waldur/features/connect';
import { SlurmFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { PageBarContext } from '@waldur/marketplace/context';

import { AllocationJobsTable } from './AllocationJobsTable';
import { AllocationUsersTable } from './AllocationUsersTable';

export const AllocationMainComponent = ({ scope, activeTab }) => {
  const isSlurmJubsVisible = isFeatureVisible(SlurmFeatures.jobs);
  const { addTabs } = useContext(PageBarContext);
  useEffect(() => {
    addTabs([
      {
        key: 'allocation-users',
        title: translate('Allocation users'),
        priority: 12,
      },
    ]);
    if (isSlurmJubsVisible) {
      addTabs([
        {
          key: 'jobs',
          title: translate('Jobs'),
          priority: 13,
        },
      ]);
    }
  });
  return scope ? (
    <>
      <div
        className={activeTab === 'allocation-users' ? 'mb-10' : 'd-none'}
        id="allocation-users"
      >
        <AllocationUsersTable scope={scope} />
      </div>
      {isSlurmJubsVisible && (
        <div className={activeTab === 'jobs' ? 'mb-10' : 'd-none'} id="jobs">
          <AllocationJobsTable scope={scope} />
        </div>
      )}
    </>
  ) : null;
};
