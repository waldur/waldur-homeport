import { OpenStackTenant } from '@/openstack/openstack-tenant/types';

export interface TenantActionProps {
  resource: OpenStackTenant;
  refetch?(): void;
}
