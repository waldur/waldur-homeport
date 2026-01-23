import { FC } from 'react';

import { AdminAccessInfoCard } from './components/AdminAccessInfoCard';
import { OrganizationalAccessSection } from './components/OrganizationalAccessSection';
import { ServiceProviderAccessSection } from './components/ServiceProviderAccessSection';
import { DataAccessVisibility } from './types';

interface EndUserDataAccessViewProps {
  data: DataAccessVisibility;
}

/**
 * Simplified data access view for end users viewing their own profile.
 * Shows:
 * - Administrative access info (description only)
 * - Organizational access (organizations/projects user is member of)
 * - Service providers (only if user has consented to any)
 *
 * Does NOT show:
 * - Summary cards with counts
 * - Access history tab
 */
export const EndUserDataAccessView: FC<EndUserDataAccessViewProps> = ({
  data,
}) => (
  <div>
    <AdminAccessInfoCard description={data.administrative_access.description} />

    <OrganizationalAccessSection
      scopes={data.organizational_access}
      isViewerStaffOrSupport={false}
    />

    {data.service_provider_access.length > 0 && (
      <ServiceProviderAccessSection
        providers={data.service_provider_access}
        isViewerStaffOrSupport={false}
      />
    )}
  </div>
);
