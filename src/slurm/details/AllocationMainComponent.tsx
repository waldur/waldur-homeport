import { useContext, useEffect } from 'react';

import { isFeatureVisible } from '@waldur/features/connect';
import { SlurmFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { PageBarContext } from '@waldur/marketplace/context';

import { AllocationJobsTable } from './AllocationJobsTable';
import { AllocationUsersTable } from './AllocationUsersTable';

export const AllocationMainComponent = ({ scope }) => {
  const isSlurmJubsVisible = isFeatureVisible(SlurmFeatures.jobs);
  const { addTabs } = useContext(PageBarContext);
  useEffect(() => {
    addTabs([
      {
        key: 'allocation-users',
        title: translate('Allocation users'),
      },
    ]);
    if (isSlurmJubsVisible) {
      addTabs([
        {
          key: 'jobs',
          title: translate('Jobs'),
        },
      ]);
    }
  });
  return scope ? (
    <>
      <div className="mb-10" id="allocation-users">
        <AllocationUsersTable scope={scope} />
      </div>
      {isSlurmJubsVisible && (
        <div className="mb-10" id="jobs">
          <AllocationJobsTable scope={scope} />
        </div>
      )}
    </>
  ) : null;
};
