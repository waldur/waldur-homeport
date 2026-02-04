import type {
  AvailabilityZoneResponse,
  CredentialsValidationResponse,
  ExternalNetworkResponse,
  FlavorResponse,
  OpenStackCredentialsRequest,
  ServiceAttributesPreview,
  VolumeTypeResponse,
} from 'waldur-js-client';

/**
 * Form values for OpenStack Discovery wizard.
 * All wizard state is stored in React Final Form values.
 */
export interface OpenStackDiscoveryFormValues extends OpenStackCredentialsRequest {
  // Step 1: Credential validation result
  credentialsValid: boolean;
  serverInfo: CredentialsValidationResponse['server_info'] | null;

  // Step 2: Discovered infrastructure
  externalNetworks: ExternalNetworkResponse[];
  selectedExternalNetworkId: string | null;
  instanceAZs: AvailabilityZoneResponse[];
  selectedInstanceAZ: string | null;
  volumeAZs: AvailabilityZoneResponse[];
  selectedVolumeAZ: string | null;
  volumeTypes: VolumeTypeResponse[];
  flavors: FlavorResponse[];

  // Step 3: Provisioning config (service_attributes)
  flavor_exclude_regex: string;
  volume_type_blacklist: string;
  console_type: string;
  console_domain_override: string;
  dns_nameservers: string[];
  create_ha_routers: boolean;
  live_resize_of_volumes_enabled: boolean;
  max_concurrent_provision_instance: number | null;
  max_concurrent_provision_volume: number | null;
  max_concurrent_provision_snapshot: number | null;

  // Step 4: Limits (plugin_options)
  default_internal_network_mtu: number | null;
  snapshot_size_limit_gb: number | null;
  max_instances: number | null;
  max_volumes: number | null;

  // Step 5: Preview result
  previewResult: ServiceAttributesPreview | null;
}

/**
 * Extract credentials from form values for API calls.
 */
export const extractCredentials = (
  values: OpenStackDiscoveryFormValues,
): OpenStackCredentialsRequest => ({
  auth_url: values.auth_url,
  username: values.username,
  password: values.password,
  user_domain_name: values.user_domain_name,
  project_domain_name: values.project_domain_name,
  project_name: values.project_name,
  verify_ssl: values.verify_ssl,
  certificate: values.certificate,
});
