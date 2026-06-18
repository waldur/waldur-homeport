import { FunctionComponent } from 'react';
import {
  customersList,
  marketplacePublicOfferingsList,
  OpenStackFlavor,
  openstackFlavorsList,
  openstackVolumeTypesNamesRetrieve,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import {
  AsyncSelectEditField,
  BoxNumberEditField,
  BooleanEditField,
  NumberEditField,
  SecretEditField,
  SelectEditField,
  StringEditField,
  TextEditField,
} from '@/form/editFields';
import { createLoadOptions } from '@/form/select';
import { TabbedSection } from '@/form/TabbedSection';
import { translate } from '@/i18n';
import { formatIntField, parseIntField } from '@/marketplace/common/utils';
import { BaseProvisioningConfigSection } from '@/marketplace/offerings/update/integration/ProvisioningConfigSection';
import { OfferingEditPanelProps } from '@/marketplace/offerings/update/integration/types';
import { TENANT_TYPE } from '@/openstack/constants';

import { RANCHER_NODE_DISK_DRIVER_OPTIONS } from './RancherCredentialsSection';

const volumeTypeLoadOptions = (query) =>
  openstackVolumeTypesNamesRetrieve().then((response) => {
    const filtered = response.data.filter((name) => name.includes(query));
    return {
      options: filtered.map((name) => ({
        value: name,
        name: name,
      })),
      hasMore: false,
      additional: {
        page: 1,
      },
    };
  });

const RANCHER_DEPLOYMENT_MODE_OPTIONS = [
  {
    label: translate('Managed'),
    value: 'managed',
  },
  {
    label: translate('Self-managed'),
    value: 'self_managed',
  },
];

const flavorLoadOptions = createLoadOptions(openstackFlavorsList, 'name', {
  field: ['name', 'uuid'],
});

const DeploymentModeField: FunctionComponent = () => (
  <SelectEditField
    name="plugin_options.deployment_mode"
    label={translate('Deployment mode')}
    options={RANCHER_DEPLOYMENT_MODE_OPTIONS}
    simpleValue
    isClearable={false}
  />
);

const SelfManagedFields: FunctionComponent = () => (
  <>
    <DeploymentModeField />
    <StringEditField
      name="plugin_options.flavors_regex"
      label={translate('Flavors regex')}
      description={translate('Regular expression to limit flavors list')}
    />
  </>
);

const ManagedFields: FunctionComponent = () => (
  <TabbedSection enableSearch>
    <TabbedSection.Tab id="rancher_server" title={translate('Rancher Server')}>
      <StringEditField
        name="secret_options.backend_url"
        label={translate('Rancher server URL')}
        required
        validate={required}
      />
      <StringEditField
        name="secret_options.username"
        label={translate('Rancher access key')}
        required
        validate={required}
      />
      <SecretEditField
        name="secret_options.password"
        label={translate('Rancher secret key')}
        required
        validate={required}
      />
    </TabbedSection.Tab>
    <TabbedSection.Tab id="kubernetes" title={translate('Kubernetes & Nodes')}>
      <StringEditField
        name="secret_options.k8s_version"
        label={translate('Kubernetes version')}
      />
      <SelectEditField
        name="secret_options.node_disk_driver"
        label={translate('Node disk driver type')}
        options={RANCHER_NODE_DISK_DRIVER_OPTIONS}
        simpleValue
        isClearable={false}
      />
      <TextEditField
        name="secret_options.cloud_init_template"
        label={translate('Cloud init template')}
      />
      <StringEditField
        name="secret_options.base_image_name"
        label={translate('Image name for Rancher nodes')}
      />
      <StringEditField
        name="secret_options.private_registry_url"
        label={translate('Private registry URL')}
      />
      <StringEditField
        name="secret_options.private_registry_user"
        label={translate('Private registry username')}
      />
      <SecretEditField
        name="secret_options.private_registry_password"
        label={translate('Private registry password')}
      />
    </TabbedSection.Tab>
    <TabbedSection.Tab
      id="openstack"
      title={translate('OpenStack Configuration')}
    >
      <AsyncSelectEditField
        name="secret_options.customer_uuid"
        label={translate('Organization')}
        description={translate('Organization where project can be created')}
        loadOptions={createLoadOptions(customersList, 'name', {
          field: ['name', 'uuid'],
        })}
        getOptionLabel={({ name }) => name}
        getOptionValue={({ uuid }) => uuid}
        required
        validate={required}
      />
      <AsyncSelectEditField
        name="plugin_options.openstack_offering_uuid_list"
        label={translate('OpenStack offerings')}
        description={translate('List of supported OpenStack offerings')}
        loadOptions={createLoadOptions(marketplacePublicOfferingsList, 'name', {
          type: [TENANT_TYPE],
          field: ['name', 'uuid'],
        })}
        getOptionLabel={({ name }) => name}
        getOptionValue={({ uuid }) => uuid}
        isMulti
      />
      <DeploymentModeField />
    </TabbedSection.Tab>
    <TabbedSection.Tab
      id="openstack_server"
      title={translate('OpenStack: Server Node')}
    >
      <AsyncSelectEditField
        name="plugin_options.managed_rancher_server_flavor_name"
        label={translate('OpenStack flavor name for server node')}
        loadOptions={flavorLoadOptions}
        getOptionLabel={({ name }: OpenStackFlavor) => name}
        getOptionValue={({ uuid }: OpenStackFlavor) => uuid}
      />
      <AsyncSelectEditField
        name="plugin_options.managed_rancher_server_system_volume_type_name"
        label={translate('OpenStack system volume type for server node')}
        loadOptions={volumeTypeLoadOptions}
        getOptionLabel={({ name }) => name}
        getOptionValue={({ value }) => value}
      />
      <BoxNumberEditField
        name="plugin_options.managed_rancher_server_system_volume_size_gb"
        label={translate('OpenStack system volume size for server node')}
        required
        validate={required}
        min={1}
        max={1000000}
        parse={parseIntField}
        format={formatIntField}
      />
      <AsyncSelectEditField
        name="plugin_options.managed_rancher_server_data_volume_type_name"
        label={translate('OpenStack data volume type for server node')}
        loadOptions={volumeTypeLoadOptions}
        getOptionLabel={({ name }) => name}
        getOptionValue={({ value }) => value}
      />
      <BoxNumberEditField
        name="plugin_options.managed_rancher_server_data_volume_size_gb"
        label={translate('OpenStack data volume size for server node')}
        required
        validate={required}
        min={1}
        max={1000000}
        parse={parseIntField}
        format={formatIntField}
      />
    </TabbedSection.Tab>
    <TabbedSection.Tab
      id="openstack_lb"
      title={translate('OpenStack: Load Balancer Node')}
    >
      <TextEditField
        name="secret_options.managed_rancher_load_balancer_cloud_init_template"
        label={translate('Cloud init template for load balancer node')}
      />
      <AsyncSelectEditField
        name="plugin_options.managed_rancher_load_balancer_flavor_name"
        label={translate('OpenStack system flavor for load balancer node')}
        loadOptions={flavorLoadOptions}
        getOptionLabel={({ name }: OpenStackFlavor) => name}
        getOptionValue={({ uuid }: OpenStackFlavor) => uuid}
      />
      <AsyncSelectEditField
        name="plugin_options.managed_rancher_load_balancer_system_volume_type_name"
        label={translate('OpenStack system volume type for load balancer node')}
        loadOptions={volumeTypeLoadOptions}
        getOptionLabel={({ name }) => name}
        getOptionValue={({ value }) => value}
      />
      <BoxNumberEditField
        name="plugin_options.managed_rancher_load_balancer_system_volume_size_gb"
        label={translate('OpenStack system volume size for load balancer node')}
        required
        validate={required}
        min={1}
        max={1000000}
        parse={parseIntField}
        format={formatIntField}
      />
      <AsyncSelectEditField
        name="plugin_options.managed_rancher_load_balancer_data_volume_type_name"
        label={translate('OpenStack data volume type for load balancer node')}
        loadOptions={volumeTypeLoadOptions}
        getOptionLabel={({ name }) => name}
        getOptionValue={({ value }) => value}
      />
      <BoxNumberEditField
        name="plugin_options.managed_rancher_load_balancer_data_volume_size_gb"
        label={translate('OpenStack data volume size for load balancer node')}
        required
        validate={required}
        min={1}
        max={1000000}
        parse={parseIntField}
        format={formatIntField}
      />
    </TabbedSection.Tab>
    <TabbedSection.Tab
      id="openstack_worker"
      title={translate('OpenStack: Worker Node')}
    >
      <AsyncSelectEditField
        name="plugin_options.managed_rancher_worker_system_volume_type_name"
        label={translate('OpenStack system volume type for worker node')}
        loadOptions={volumeTypeLoadOptions}
        getOptionLabel={({ name }) => name}
        getOptionValue={({ value }) => value}
      />
      <BoxNumberEditField
        name="plugin_options.managed_rancher_worker_system_volume_size_gb"
        label={translate('OpenStack system volume size for worker node')}
        required
        validate={required}
        min={1}
        max={1000000}
        parse={parseIntField}
        format={formatIntField}
      />
    </TabbedSection.Tab>
    <TabbedSection.Tab
      id="cluster_tenants"
      title={translate('Cluster Tenants')}
    >
      <BoxNumberEditField
        name="plugin_options.managed_rancher_tenant_max_cpu"
        label={translate('Maximum number of CPU for cluster tenants')}
        required
        validate={required}
        min={1}
        max={1000000}
        parse={parseIntField}
        format={formatIntField}
      />
      <BoxNumberEditField
        name="plugin_options.managed_rancher_tenant_max_ram"
        label={translate('Maximum number of RAM for a cluster tenants (GB)')}
        required
        validate={required}
        min={1}
        max={1000000}
        parse={parseIntField}
        format={formatIntField}
      />
      <BoxNumberEditField
        name="plugin_options.managed_rancher_tenant_max_disk"
        label={translate(
          'Maximum number of disk space for a cluster tenants (GB)',
        )}
        required
        validate={required}
        min={1}
        max={1000000}
        parse={parseIntField}
        format={formatIntField}
      />
    </TabbedSection.Tab>
    <TabbedSection.Tab id="vault" title={translate('Vault Configuration')}>
      <StringEditField
        name="secret_options.vault_host"
        label={translate('Vault Host')}
      />
      <NumberEditField
        name="secret_options.vault_port"
        label={translate('Vault Port')}
        parse={parseIntField}
        format={formatIntField}
      />
      <SecretEditField
        name="secret_options.vault_token"
        label={translate('Vault Token')}
      />
      <BooleanEditField
        name="secret_options.vault_tls_verify"
        label={translate('Vault TLS verify')}
      />
    </TabbedSection.Tab>
    <TabbedSection.Tab
      id="keycloak"
      title={translate('Keycloak Configuration')}
    >
      <StringEditField
        name="secret_options.keycloak_url"
        label={translate('Keycloak URL')}
      />
      <StringEditField
        name="secret_options.keycloak_realm"
        label={translate('Keycloak Realm')}
      />
      <StringEditField
        name="secret_options.keycloak_user_realm"
        label={translate('Keycloak User Realm')}
      />
      <StringEditField
        name="secret_options.keycloak_username"
        label={translate('Keycloak username')}
      />
      <SecretEditField
        name="secret_options.keycloak_password"
        label={translate('Keycloak password')}
      />
      <BoxNumberEditField
        name="secret_options.keycloak_sync_frequency"
        label={translate('Keycloak sync frequency')}
        parse={parseIntField}
        format={formatIntField}
      />
      <BooleanEditField
        name="secret_options.keycloak_ssl_verify"
        label={translate('Keycloak TLS verify')}
      />
    </TabbedSection.Tab>
    <TabbedSection.Tab id="argocd" title={translate('ArgoCD Configuration')}>
      <StringEditField
        name="secret_options.argocd_k8s_namespace"
        label={translate('ArgoCD K8S namespace')}
      />
      <TextEditField
        name="secret_options.argocd_k8s_kubeconfig"
        label={translate('ArgoCD K8S kubeconfig')}
      />
    </TabbedSection.Tab>
  </TabbedSection>
);

export const RancherProvisioningConfigurationForm: FunctionComponent<
  OfferingEditPanelProps
> = (props) => {
  return (
    <BaseProvisioningConfigSection {...props}>
      {props.offering.plugin_options.deployment_mode === 'managed' ? (
        <ManagedFields />
      ) : (
        <SelfManagedFields />
      )}
    </BaseProvisioningConfigSection>
  );
};
