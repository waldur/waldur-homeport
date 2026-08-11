/**
 * Multi-Datacenter Kubernetes Cluster Configuration Types
 *
 * Supports the correct logical flow:
 * 1. Kubernetes Version
 * 2. Topology Selection (1 or 3 datacenters)
 * 3. Per-Datacenter OpenStack Infrastructure
 * 4. Per-Datacenter Worker/Storage Groups with flavor selection
 */

import { translate } from '@/i18n';

export interface LocalOpenStackFlavor {
  uuid: string;
  name: string;
  vcpus: number;
  ram: number; // in MB
  disk: number; // in GB
}

interface DatacenterDiskConfiguration {
  system_disk_size_gb: number; // Pre-configured, read-only for display
  data_disk_size_gb: number; // User-configurable
  virtual_san_disk_size_gb?: number; // Only for storage groups
}

export interface DatacenterNodeGroup {
  id: string;
  type: 'worker' | 'storage';
  node_count: number;
  openstack_flavor?: LocalOpenStackFlavor;
  disk_config: DatacenterDiskConfiguration;
}

export interface DatacenterConfiguration {
  id: string;
  name: string; // e.g., "Datacenter 1", "Datacenter 2", "Datacenter 3"
  openstack_infrastructure?: {
    uuid: string;
    name: string;
    customer_name: string;
  };
  node_groups: DatacenterNodeGroup[];
}

export interface MultiDatacenterK8sClusterConfig {
  kubernetes_version: string;
  topology: '1-datacenter' | '3-datacenter';
  datacenters: DatacenterConfiguration[];
  public_access_rules?: any[]; // Security rules for public access
  administrative_access_rules?: any[]; // Security rules for admin access
  install_longhorn?: boolean; // Optional Longhorn distributed storage installation
}

export interface K8sDefaultConfiguration {
  default_controller_vcpus?: number;
  default_controller_ram_gb?: number;
  default_controller_system_disk_gb?: number;
  default_controller_etcd_disk_gb?: number;
  default_lb_vcpus?: number;
  default_lb_ram_gb?: number;
  default_lb_system_disk_gb?: number;
  default_lb_logs_disk_gb?: number;
  minimal_worker_vcpus?: number;
  minimal_worker_ram_gb?: number;
  default_worker_data_disk_gb?: number;
  default_storage_data_disk_gb?: number;
  default_storage_san_disk_gb?: number;
  available_kubernetes_versions?: string;
}

// Default configurations - used internally
const DEFAULT_K8S_CONFIGURATION: K8sDefaultConfiguration = {
  default_controller_vcpus: 4,
  default_controller_ram_gb: 8,
  default_controller_system_disk_gb: 20,
  default_controller_etcd_disk_gb: 50,
  default_lb_vcpus: 2,
  default_lb_ram_gb: 8,
  default_lb_system_disk_gb: 20,
  default_lb_logs_disk_gb: 20,
  minimal_worker_vcpus: 2,
  minimal_worker_ram_gb: 4,
  default_worker_data_disk_gb: 100,
  default_storage_data_disk_gb: 100,
  default_storage_san_disk_gb: 500,
};

// Dynamic configuration functions

/**
 * Get available Kubernetes versions based on configuration
 */
export const getAvailableKubernetesVersions = (
  defaultConfigs?: K8sDefaultConfiguration,
) => {
  if (
    !defaultConfigs?.available_kubernetes_versions ||
    defaultConfigs.available_kubernetes_versions.trim() === ''
  ) {
    return [];
  }

  // Parse comma-separated versions from configuration
  const configuredVersions = defaultConfigs.available_kubernetes_versions
    .split(',')
    .map((version) => version.trim())
    .filter((version) => version.length > 0);

  // Convert to the expected format
  return configuredVersions.map((version) => ({
    value: version,
    label: `Kubernetes ${version}`,
  }));
};

/**
 * Validate configuration completeness and return warnings
 */
export const validateK8sConfiguration = (
  defaultConfigs?: K8sDefaultConfiguration,
): string[] => {
  const warnings: string[] = [];

  if (
    !defaultConfigs?.available_kubernetes_versions ||
    defaultConfigs.available_kubernetes_versions.trim() === ''
  ) {
    warnings.push(
      'Kubernetes versions configuration is missing. Please configure available Kubernetes versions in the offering settings.',
    );
  }

  // Validate that configured versions are valid
  if (defaultConfigs?.available_kubernetes_versions) {
    const versions = defaultConfigs.available_kubernetes_versions
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    if (versions.length === 0) {
      warnings.push(
        'No valid Kubernetes versions found in configuration. Please provide comma-separated version numbers.',
      );
    }

    // Basic version format validation
    const invalidVersions = versions.filter(
      (version) => !/^\d+\.\d+\.\d+$/.test(version),
    );
    if (invalidVersions.length > 0) {
      warnings.push(
        `Invalid Kubernetes version format(s): ${invalidVersions.join(', ')}. Expected format: x.y.z`,
      );
    }
  }

  return warnings;
};

/**
 * Check if configuration is complete for form display
 */
export const isK8sConfigurationComplete = (
  defaultConfigs?: K8sDefaultConfiguration,
): boolean => {
  return validateK8sConfiguration(defaultConfigs).length === 0;
};

// Utility functions

export const getDefaultDatacenterDiskConfig = (
  defaultConfigs?: K8sDefaultConfiguration,
): DatacenterDiskConfiguration => ({
  system_disk_size_gb: 20, // Always pre-configured
  data_disk_size_gb: defaultConfigs?.default_worker_data_disk_gb || 100,
});

export const getDefaultStorageDiskConfig = (
  defaultConfigs?: K8sDefaultConfiguration,
): DatacenterDiskConfiguration => ({
  system_disk_size_gb: 20, // Always pre-configured
  data_disk_size_gb: defaultConfigs?.default_storage_data_disk_gb || 100,
  virtual_san_disk_size_gb: defaultConfigs?.default_storage_san_disk_gb || 500,
});

export const createDefaultClusterConfig = (
  topology: '1-datacenter' | '3-datacenter',
  defaultConfigs?: K8sDefaultConfiguration,
): MultiDatacenterK8sClusterConfig => {
  const datacenterCount = topology === '1-datacenter' ? 1 : 3;
  const datacenters = Array.from({ length: datacenterCount }, (_, i) => ({
    id: `datacenter-${i + 1}`,
    name: `Datacenter ${i + 1}`,
    node_groups: [
      {
        id: `dc${i + 1}-worker-1`,
        type: 'worker' as const,
        node_count: 3,
        disk_config: getDefaultDatacenterDiskConfig(defaultConfigs),
      },
    ],
  }));

  // Preselect the first version the offering actually advertises. A hardcoded
  // default would leave the select showing its placeholder (the value is not
  // among its options) while the form silently holds a version the offering
  // does not support. An empty string keeps the field unset, so the required
  // check in validateMultiDatacenterConfiguration reports it.
  const [defaultVersion] = getAvailableKubernetesVersions(defaultConfigs);

  return {
    kubernetes_version: defaultVersion?.value ?? '',
    topology,
    datacenters,
  };
};

export const getControllerNodesCount = (
  topology: '1-datacenter' | '3-datacenter',
  datacenterIndex: number,
): number => {
  if (topology === '1-datacenter') {
    // For single datacenter: 3 controllers in the single datacenter
    return datacenterIndex === 0 ? 3 : 0;
  } else {
    // For 3-datacenter: 1 controller per datacenter
    return 1;
  }
};

export const getLoadBalancerNodesCount = (
  topology: '1-datacenter' | '3-datacenter',
  datacenterIndex: number,
): number => {
  if (topology === '1-datacenter') {
    // For single datacenter: 1 load balancer in the single datacenter
    return datacenterIndex === 0 ? 1 : 0;
  } else {
    // For 3-datacenter: 1 load balancer per datacenter
    return 1;
  }
};

export const calculateDatacenterResources = (
  datacenter: DatacenterConfiguration,
  topology: '1-datacenter' | '3-datacenter',
  datacenterIndex: number,
  defaultConfigs: K8sDefaultConfiguration = DEFAULT_K8S_CONFIGURATION,
) => {
  let workerNodes = 0;
  let storageNodes = 0;
  let totalVCpus = 0;
  let totalRam = 0; // in GB
  let totalSystemStorage = 0;
  let totalDataStorage = 0;
  let totalSanStorage = 0;

  // Calculate worker/storage nodes
  datacenter.node_groups.forEach((group) => {
    if (group.type === 'worker') {
      workerNodes += group.node_count;
    } else if (group.type === 'storage') {
      storageNodes += group.node_count;
    }

    if (group.openstack_flavor) {
      totalVCpus += group.openstack_flavor.vcpus * group.node_count;
      totalRam += Math.round(
        (group.openstack_flavor.ram / 1024) * group.node_count,
      ); // Convert MB to GB
    }

    totalSystemStorage +=
      group.disk_config.system_disk_size_gb * group.node_count;
    totalDataStorage += group.disk_config.data_disk_size_gb * group.node_count;

    if (group.disk_config.virtual_san_disk_size_gb) {
      totalSanStorage +=
        group.disk_config.virtual_san_disk_size_gb * group.node_count;
    }
  });

  // Add controller and load balancer nodes
  const controllerNodes = getControllerNodesCount(topology, datacenterIndex);
  const loadBalancerNodes = getLoadBalancerNodesCount(
    topology,
    datacenterIndex,
  );
  const totalNodes =
    workerNodes + storageNodes + controllerNodes + loadBalancerNodes;

  // Controller nodes use configured default resources
  const controllerVCpus =
    controllerNodes * (defaultConfigs.default_controller_vcpus || 2);
  const controllerRam =
    controllerNodes * (defaultConfigs.default_controller_ram_gb || 4);
  const controllerSystemStorage =
    controllerNodes * (defaultConfigs.default_controller_system_disk_gb || 20);
  const controllerDataStorage =
    controllerNodes * (defaultConfigs.default_controller_etcd_disk_gb || 50);

  // Load balancer nodes use configured default resources
  const lbVCpus = loadBalancerNodes * (defaultConfigs.default_lb_vcpus || 2);
  const lbRam = loadBalancerNodes * (defaultConfigs.default_lb_ram_gb || 8);
  const lbSystemStorage =
    loadBalancerNodes * (defaultConfigs.default_lb_system_disk_gb || 20);
  const lbDataStorage =
    loadBalancerNodes * (defaultConfigs.default_lb_logs_disk_gb || 20);

  return {
    workerNodes,
    storageNodes,
    controllerNodes,
    loadBalancerNodes,
    totalNodes,
    totalVCpus: totalVCpus + controllerVCpus + lbVCpus,
    totalRam: totalRam + controllerRam + lbRam,
    totalSystemStorage:
      totalSystemStorage + controllerSystemStorage + lbSystemStorage,
    totalDataStorage: totalDataStorage + controllerDataStorage + lbDataStorage,
    totalSanStorage,
  };
};

export const calculateTotalClusterResources = (
  config: MultiDatacenterK8sClusterConfig,
  defaultConfigs?: K8sDefaultConfiguration,
) => {
  return config.datacenters.reduce(
    (totals, datacenter, index) => {
      const dcResources = calculateDatacenterResources(
        datacenter,
        config.topology,
        index,
        defaultConfigs,
      );
      return {
        totalNodes: totals.totalNodes + dcResources.totalNodes,
        totalWorkerNodes: totals.totalWorkerNodes + dcResources.workerNodes,
        totalStorageNodes: totals.totalStorageNodes + dcResources.storageNodes,
        totalControllerNodes:
          totals.totalControllerNodes + dcResources.controllerNodes,
        totalLoadBalancerNodes:
          totals.totalLoadBalancerNodes + dcResources.loadBalancerNodes,
        totalVCpus: totals.totalVCpus + dcResources.totalVCpus,
        totalRam: totals.totalRam + dcResources.totalRam,
        totalSystemStorage:
          totals.totalSystemStorage + dcResources.totalSystemStorage,
        totalDataStorage:
          totals.totalDataStorage + dcResources.totalDataStorage,
        totalSanStorage: totals.totalSanStorage + dcResources.totalSanStorage,
      };
    },
    {
      totalNodes: 0,
      totalWorkerNodes: 0,
      totalStorageNodes: 0,
      totalControllerNodes: 0,
      totalLoadBalancerNodes: 0,
      totalVCpus: 0,
      totalRam: 0,
      totalSystemStorage: 0,
      totalDataStorage: 0,
      totalSanStorage: 0,
    },
  );
};

const validateDatacenterConfiguration = (
  datacenter: DatacenterConfiguration,
): string[] => {
  const errors: string[] = [];

  if (!datacenter.openstack_infrastructure) {
    errors.push(
      `${datacenter.name}: OpenStack infrastructure must be selected`,
    );
  }

  if (datacenter.node_groups.length === 0) {
    errors.push(`${datacenter.name}: At least one node group is required`);
  }

  const hasWorkerGroup = datacenter.node_groups.some(
    (group) => group.type === 'worker',
  );
  if (!hasWorkerGroup) {
    errors.push(`${datacenter.name}: At least one worker group is required`);
  }

  datacenter.node_groups.forEach((group, index) => {
    if (!group.openstack_flavor) {
      errors.push(
        `${datacenter.name} ${group.type} group ${index + 1}: OpenStack flavor must be selected`,
      );
    }

    if (group.node_count < 1) {
      errors.push(
        `${datacenter.name} ${group.type} group ${index + 1}: Node count must be at least 1`,
      );
    }

    if (group.disk_config.data_disk_size_gb < 10) {
      errors.push(
        `${datacenter.name} ${group.type} group ${index + 1}: Data disk must be at least 10GB`,
      );
    }

    if (
      group.type === 'storage' &&
      (!group.disk_config.virtual_san_disk_size_gb ||
        group.disk_config.virtual_san_disk_size_gb < 100)
    ) {
      errors.push(
        `${datacenter.name} ${group.type} group ${index + 1}: Virtual SAN disk must be at least 100GB`,
      );
    }
  });

  return errors;
};

export const validateMultiDatacenterConfiguration = (
  config: MultiDatacenterK8sClusterConfig,
): string[] => {
  const errors: string[] = [];

  if (!config.kubernetes_version) {
    errors.push('Kubernetes version must be selected');
  }

  if (!config.topology) {
    errors.push('Cluster topology must be selected');
  }

  const expectedDatacenters = config.topology === '1-datacenter' ? 1 : 3;
  if (config.datacenters.length !== expectedDatacenters) {
    errors.push(
      `${config.topology} requires exactly ${expectedDatacenters} datacenter(s), but ${config.datacenters.length} configured`,
    );
  }

  config.datacenters.forEach((datacenter) => {
    errors.push(...validateDatacenterConfiguration(datacenter));
  });

  // Validate Longhorn storage requirements
  if (config.install_longhorn) {
    const totalStorageNodes = config.datacenters.reduce((total, datacenter) => {
      return (
        total +
        datacenter.node_groups
          .filter((group) => group.type === 'storage')
          .reduce((sum, group) => sum + group.node_count, 0)
      );
    }, 0);

    if (totalStorageNodes < 3) {
      errors.push(
        'Longhorn installation requires at least 3 storage nodes across all datacenters',
      );
    }

    const hasStorageGroup = config.datacenters.some((datacenter) =>
      datacenter.node_groups.some((group) => group.type === 'storage'),
    );

    if (!hasStorageGroup) {
      errors.push(
        'Longhorn installation requires at least one storage node group',
      );
    }
  }

  return errors;
};

export const validateNumberOrRange = (value) => {
  // const regex = /^\\d+(-\\d+)?$/;
  const regex = /^\d+(-\d+)?$/;

  if (!regex.test(value)) {
    return translate("Fails format validation. e.g., '80' or '80-100'");
  }

  // If format is valid, perform numeric validation
  const parts = value.split('-');
  const startNum = parseInt(parts[0]);

  if (parts.length === 2) {
    const endNum = parseInt(parts[1]);
    // Ensure the end number is not empty and the start is <= end
    if (isNaN(endNum) || startNum > endNum) {
      return translate(
        'Invalid range. Ensure the end number is greater than or equal to the start number.',
      );
    }
  }

  return undefined;
};
