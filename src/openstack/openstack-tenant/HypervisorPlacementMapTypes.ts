import { OpenStackInstance } from 'waldur-js-client';

export interface PlacementInstance extends Pick<
  OpenStackInstance,
  | 'uuid'
  | 'cores'
  | 'customer_name'
  | 'hypervisor_hostname'
  | 'name'
  | 'project_name'
  | 'ram'
  | 'runtime_state'
  | 'server_group'
> {
  /** Offering name from the marketplace Resource (used as "Tenant" label) */
  offering_name?: string;
}
