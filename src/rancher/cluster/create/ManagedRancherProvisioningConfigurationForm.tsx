import { FunctionComponent } from 'react';
import {
  customersList,
  marketplacePublicOfferingsList,
  OpenStackFlavor,
  openstackFlavorsList,
  openstackVolumeTypesList,
} from 'waldur-js-client';

import { parseSelectData } from '@waldur/core/api';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import { required } from '@waldur/core/validators';
import {
  SecretField,
  StringField,
  TextField,
  NumberField,
  SelectField,
} from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { BoxNumberField } from '@waldur/form/BoxNumberField';
import { translate } from '@waldur/i18n';
import {
  formatIntField,
  parseIntField,
} from '@waldur/marketplace/common/utils';
import {
  DefaultOfferingEditPanel,
  OfferingEditField,
} from '@waldur/marketplace/offerings/update/DefaultOfferingEditPanel';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';
import { TENANT_TYPE } from '@waldur/openstack/constants';
import { RANCHER_NODE_DISK_DRIVER_OPTIONS } from '@waldur/rancher/RancherProviderForm';

const VOLUME_TYPE_FIELD: Partial<OfferingEditField> = {
  component: AsyncSelectField,
  fieldProps: {
    loadOptions: (query, prevOptions, currentPage) =>
      openstackVolumeTypesList({
        query: {
          name: query,
          page: currentPage,
        },
      }).then((response) =>
        returnReactSelectAsyncPaginateObject(
          parseSelectData(response),
          prevOptions,
          currentPage,
        ),
      ),
    getOptionLabel: ({ name }: OpenStackFlavor) => name,
    getOptionKey: ({ uuid }: OpenStackFlavor) => uuid,
  },
};

const VOLUME_SIZE_FIELD: Partial<OfferingEditField> = {
  component: BoxNumberField,
  fieldProps: {
    required: true,
    validate: required,
    min: 1,
    parse: parseIntField,
    format: formatIntField,
  },
};

const FLAVOR_FIELD: Partial<OfferingEditField> = {
  component: AsyncSelectField,
  fieldProps: {
    loadOptions: (query, prevOptions, currentPage) =>
      openstackFlavorsList({
        query: {
          name: query,
          page: currentPage,
          field: ['name', 'uuid'],
        },
      }).then((response) =>
        returnReactSelectAsyncPaginateObject(
          parseSelectData(response),
          prevOptions,
          currentPage,
        ),
      ),
    getOptionLabel: ({ name }: OpenStackFlavor) => name,
    getOptionKey: ({ uuid }: OpenStackFlavor) => uuid,
  },
};

const fields: OfferingEditField[] = [
  {
    label: translate('OpenStack offerings'),
    key: 'plugin_options.openstack_offering_uuid_list',
    component: AsyncSelectField,
    description: translate('List of supported OpenStack offerings'),
    fieldProps: {
      loadOptions: (query, prevOptions, currentPage) =>
        marketplacePublicOfferingsList({
          query: {
            name: query,
            type: [TENANT_TYPE],
            page: currentPage,
            field: ['name', 'uuid'],
          },
        }).then((response) =>
          returnReactSelectAsyncPaginateObject(
            parseSelectData(response),
            prevOptions,
            currentPage,
          ),
        ),
      getOptionLabel: ({ name }) => name,
      getOptionKey: ({ uuid }) => uuid,
      isMulti: true,
    },
  },
  {
    label: translate('OpenStack flavor name for server node'),
    key: 'plugin_options.managed_rancher_server_flavor_name',
    ...FLAVOR_FIELD,
  },
  {
    label: translate('OpenStack system volume type for server node'),
    key: 'plugin_options.managed_rancher_server_system_volume_type_name',
    ...VOLUME_TYPE_FIELD,
  },
  {
    label: translate('OpenStack system volume size for server node'),
    key: 'plugin_options.managed_rancher_server_system_volume_size_gb',
    ...VOLUME_SIZE_FIELD,
  },
  {
    label: translate('Cloud init template for load balancer node'),
    key: 'secret_options.managed_rancher_load_balancer_cloud_init_template',
    component: TextField,
  },
  {
    label: translate('OpenStack system flavor for load balancer node'),
    key: 'plugin_options.managed_rancher_load_balancer_flavor_name',
    ...FLAVOR_FIELD,
  },
  {
    label: translate('OpenStack system volume type for load balancer node'),
    key: 'plugin_options.managed_rancher_load_balancer_system_volume_type_name',
    ...VOLUME_TYPE_FIELD,
  },
  {
    label: translate('OpenStack system volume size for load balancer node'),
    key: 'plugin_options.managed_rancher_load_balancer_system_volume_size_gb',
    ...VOLUME_SIZE_FIELD,
  },
  {
    label: translate('OpenStack data volume type for load balancer node'),
    key: 'plugin_options.managed_rancher_load_balancer_data_volume_type_name',
    ...VOLUME_TYPE_FIELD,
  },
  {
    label: translate('OpenStack data volume size for load balancer node'),
    key: 'plugin_options.managed_rancher_load_balancer_data_volume_size_gb',
    ...VOLUME_SIZE_FIELD,
  },
  {
    label: translate('OpenStack data volume type for server node'),
    key: 'plugin_options.managed_rancher_server_data_volume_type_name',
    ...VOLUME_TYPE_FIELD,
  },
  {
    label: translate('OpenStack data volume size for server node'),
    key: 'plugin_options.managed_rancher_server_data_volume_size_gb',
    ...VOLUME_SIZE_FIELD,
  },
  {
    label: translate('OpenStack system volume type for worker node'),
    key: 'plugin_options.managed_rancher_worker_system_volume_type_name',
    ...VOLUME_TYPE_FIELD,
  },
  {
    label: translate('OpenStack system volume size for worker node'),
    key: 'plugin_options.managed_rancher_worker_system_volume_size_gb',
    ...VOLUME_SIZE_FIELD,
  },
  {
    label: translate('Maximum number of CPU for cluster tenants'),
    key: 'plugin_options.managed_rancher_tenant_max_cpu',
    ...VOLUME_SIZE_FIELD,
  },
  {
    label: translate('Maximum number of RAM for a cluster tenants'),
    key: 'plugin_options.managed_rancher_tenant_max_ram',
    ...VOLUME_SIZE_FIELD,
  },
  {
    label: translate('Maximum number of disk space for a cluster tenants'),
    key: 'plugin_options.managed_rancher_tenant_max_disk',
    ...VOLUME_SIZE_FIELD,
  },
  {
    label: translate('Organization'),
    key: 'secret_options.customer_uuid',
    component: AsyncSelectField,
    description: translate('Organization where project can be created'),
    fieldProps: {
      loadOptions: (query, prevOptions, currentPage) =>
        customersList({
          query: {
            name: query,
            page: currentPage,
            field: ['name', 'uuid'],
          },
        }).then((response) =>
          returnReactSelectAsyncPaginateObject(
            parseSelectData(response),
            prevOptions,
            currentPage,
          ),
        ),
      getOptionLabel: ({ name }) => name,
      getOptionKey: ({ uuid }) => uuid,
      required: true,
      validate: [required],
    },
  },
  {
    label: translate('Rancher server URL'),
    key: 'secret_options.backend_url',
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Rancher access key'),
    key: 'secret_options.username',
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Rancher secret key'),
    key: 'secret_options.password',
    component: SecretField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Cloud init template'),
    key: 'secret_options.cloud_init_template',
    component: TextField,
  },
  {
    label: translate('Image name for Rancher nodes'),
    key: 'secret_options.base_image_name',
    component: StringField,
  },
  {
    label: translate('Kubernetes version'),
    key: 'secret_options.k8s_version',
    component: StringField,
  },
  {
    label: translate('Private registry URL'),
    key: 'secret_options.private_registry_url',
    component: StringField,
  },
  {
    label: translate('Private registry username'),
    key: 'secret_options.private_registry_user',
    component: StringField,
  },
  {
    label: translate('Private registry password'),
    key: 'secret_options.private_registry_password',
    component: SecretField,
  },
  {
    label: translate('Vault Host'),
    key: 'secret_options.vault_host',
    component: StringField,
  },
  {
    label: translate('Vault Port'),
    key: 'secret_options.vault_port',
    component: NumberField,
    fieldProps: {
      parse: parseIntField,
      format: formatIntField,
    },
  },
  {
    label: translate('Vault Token'),
    key: 'secret_options.vault_token',
    component: SecretField,
  },
  {
    label: translate('Vault TLS verify'),
    key: 'secret_options.vault_tls_verify',
    component: AwesomeCheckboxField,
  },
  {
    label: translate('Keycloak URL'),
    key: 'secret_options.keycloak_url',
    component: StringField,
  },
  {
    label: translate('Keycloak Realm'),
    key: 'secret_options.keycloak_realm',
    component: StringField,
  },
  {
    label: translate('Keycloak User Realm'),
    key: 'secret_options.keycloak_user_realm',
    component: StringField,
  },
  {
    label: translate('Keycloak username'),
    key: 'secret_options.keycloak_username',
    component: StringField,
  },
  {
    label: translate('Keycloak password'),
    key: 'secret_options.keycloak_password',
    component: SecretField,
  },
  {
    label: translate('Keycloak sync frequency'),
    key: 'secret_options.keycloak_sync_frequency',
    component: BoxNumberField,
    fieldProps: {
      parse: parseIntField,
      format: formatIntField,
    },
  },
  {
    label: translate('Keycloak TLS verify'),
    key: 'secret_options.keycloak_ssl_verify',
    component: AwesomeCheckboxField,
  },
  {
    label: translate('ArgoCD K8S namespace'),
    key: 'secret_options.argocd_k8s_namespace',
    component: StringField,
  },
  {
    label: translate('ArgoCD K8S kubeconfig'),
    key: 'secret_options.argocd_k8s_kubeconfig',
    component: TextField,
  },
  {
    label: translate('Node disk driver type'),
    key: 'secret_options.node_disk_driver',
    component: SelectField,
    fieldProps: {
      options: RANCHER_NODE_DISK_DRIVER_OPTIONS,
      simpleValue: true,
      isClearable: false,
    },
  },
];

export const ManagedRancherProvisioningConfigurationForm: FunctionComponent<
  OfferingEditPanelFormProps
> = (props) => <DefaultOfferingEditPanel fields={fields} {...props} />;
