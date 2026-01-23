import { FC } from 'react';

import { AdministrativeAccessSection } from './components/AdministrativeAccessSection';
import { OrganizationalAccessSection } from './components/OrganizationalAccessSection';
import { ServiceProviderAccessSection } from './components/ServiceProviderAccessSection';
import { DataAccessVisibility as DataAccessVisibilityType } from './types';

interface DataAccessVisibilityProps {
  data: DataAccessVisibilityType;
  isViewerStaffOrSupport: boolean;
}

export const DataAccessVisibility: FC<DataAccessVisibilityProps> = ({
  data,
  isViewerStaffOrSupport,
}) => (
  <div>
    <AdministrativeAccessSection
      data={data.administrative_access}
      isViewerStaffOrSupport={isViewerStaffOrSupport}
    />

    <OrganizationalAccessSection
      scopes={data.organizational_access}
      isViewerStaffOrSupport={isViewerStaffOrSupport}
    />

    <ServiceProviderAccessSection
      providers={data.service_provider_access}
      isViewerStaffOrSupport={isViewerStaffOrSupport}
    />
  </div>
);
