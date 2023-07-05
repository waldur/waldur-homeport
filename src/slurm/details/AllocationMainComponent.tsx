import { isFeatureVisible } from '@waldur/features/connect';

import { AllocationJobsTable } from './AllocationJobsTable';
import { AllocationUsersTable } from './AllocationUsersTable';

export const AllocationMainComponent = ({ scope }) => (
  <>
    <div className="mb-10">
      <AllocationUsersTable scope={scope} />
    </div>
    {isFeatureVisible('slurm.jobs') && (
      <div className="mb-10">
        <AllocationJobsTable scope={scope} />
      </div>
    )}
  </>
);
