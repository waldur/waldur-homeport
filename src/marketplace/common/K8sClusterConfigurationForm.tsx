import { isEqual } from 'es-toolkit';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { marketplacePublicOfferingsList } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { MAX_PAGE_SIZE } from '@/core/api';
import { FormField } from '@/form/types';
import { translate } from '@/i18n';
import { useCustomer } from '@/workspace/hooks';

import {
  MultiDatacenterK8sClusterConfig,
  DatacenterConfiguration,
  K8sClusterTopology,
  calculateTotalClusterResources,
  getInitialClusterConfig,
  changeClusterTopology,
  getInitialTopology,
  getTopologyMode,
  hasSiteChoices,
  isProviderFixed,
  isTopologyAllowed,
  hasLoadBalancer,
  K8sDefaultConfiguration,
} from './k8s-types';
import { K8sDatacenterCard } from './K8sDatacenterCard';
import { K8sFixedSiteDatacenters } from './K8sFixedSiteDatacenters';
import { K8sFormSection } from './K8sFormSection';
import { K8sKubernetesConfigSection } from './K8sKubernetesConfigSection';
import { K8sOptionCard } from './K8sOptionCard';
import { K8sSecurityConfigSection } from './K8sSecurityConfigSection';
import { K8sTotalResourcesCard } from './K8sTotalResourcesCard';

interface K8sClusterConfigurationFormProps extends FormField {
  field: {
    type?: string;
    label?: string;
    help_text?: string;
    required?: boolean;
  };
  // The option's name and its offering: where the sites the provider fixed
  // are looked up (infrastructure_mode provider_fixed).
  optionName?: string;
  offeringUuid?: string;
}

/**
 * Order form for a Kubernetes cluster option. The topology comes from the
 * offering's topology_mode; when it is not set the customer picks it here.
 */
export const K8sClusterConfigurationForm: React.FC<
  K8sClusterConfigurationFormProps
> = ({ field, input, meta, optionName, offeringUuid }) => {
  const customer = useCustomer();

  // Extract default configurations from the field (set via EditOptionDialog)
  const defaultConfigs: K8sDefaultConfiguration | undefined = (field as any)
    ?.default_configs;
  const topologyMode = getTopologyMode(defaultConfigs);
  // The provider fixed the sites: the customer picks none.
  const providerFixed = isProviderFixed(defaultConfigs);

  // The value is stored directly as the cluster config
  const fieldValue = input?.value as MultiDatacenterK8sClusterConfig;

  const [clusterConfig, setClusterConfig] =
    useState<MultiDatacenterK8sClusterConfig>(() =>
      getInitialClusterConfig(
        getInitialTopology(fieldValue, defaultConfigs),
        fieldValue || undefined,
        defaultConfigs,
      ),
    );
  const [topologyChanged, setTopologyChanged] = useState(false);
  const topology = clusterConfig.topology;
  const topologyAllowed = isTopologyAllowed(clusterConfig, defaultConfigs);

  const [availableInfrastructures, setAvailableInfrastructures] = useState<
    any[]
  >([]);
  const [loadingInfrastructures, setLoadingInfrastructures] = useState(false);

  const loadInfrastructures = useCallback(async () => {
    setLoadingInfrastructures(true);
    try {
      const result = await marketplacePublicOfferingsList({
        query: {
          page_size: MAX_PAGE_SIZE,
          type: ['OpenStack.Tenant'],
          state: ['Active'],
        },
      });
      setAvailableInfrastructures(result.data);
    } catch {
      setAvailableInfrastructures([]);
    } finally {
      setLoadingInfrastructures(false);
    }
  }, [customer?.uuid]);

  // Load OpenStack infrastructures only once, and only for the customer to
  // pick from.
  useEffect(() => {
    if (!providerFixed) {
      loadInfrastructures();
    }
  }, [loadInfrastructures, providerFixed]);

  // Update parent form when config changes (memoized to prevent infinite loops)
  const inputRef = useRef(input);
  inputRef.current = input;

  useEffect(() => {
    // Leave an unchanged stored value alone, so opening a resource option
    // dialog does not rewrite the resource's cluster.
    if (
      inputRef.current?.onChange &&
      !isEqual(inputRef.current.value, clusterConfig)
    ) {
      inputRef.current.onChange(clusterConfig);
    }
  }, [clusterConfig]);

  const handleKubernetesVersionChange = (version: string) => {
    setClusterConfig({
      ...clusterConfig,
      kubernetes_version: version,
    });
  };

  const handleLonghornChange = (value: boolean) => {
    setClusterConfig({
      ...clusterConfig,
      install_longhorn: value,
    });
  };

  const handleLoadBalancerChange = (value: boolean) => {
    setClusterConfig({
      ...clusterConfig,
      load_balancer: value,
    });
  };

  const handleTopologyChange = (value: K8sClusterTopology) => {
    if (!value || value === topology) {
      return;
    }
    setClusterConfig(
      changeClusterTopology(clusterConfig, value, defaultConfigs),
    );
    // Say so only when the switch discarded something the customer chose.
    setTopologyChanged(hasSiteChoices(clusterConfig, defaultConfigs));
  };

  const updateDatacenter = (
    index: number,
    updatedDatacenter: DatacenterConfiguration,
  ) => {
    const updatedDatacenters = clusterConfig.datacenters.map((dc, idx) =>
      idx === index ? updatedDatacenter : dc,
    );

    setClusterConfig({
      ...clusterConfig,
      datacenters: updatedDatacenters,
    });
  };

  const totalResources = calculateTotalClusterResources(
    clusterConfig,
    defaultConfigs,
  );
  const loadBalancer = hasLoadBalancer(clusterConfig, defaultConfigs);

  return (
    <K8sOptionCard
      label={field?.label}
      helpText={field?.help_text}
      required={field?.required}
      error={meta?.error}
    >
      {!topologyAllowed && (
        <AlertItem
          type="floating"
          variant="warning"
          className="mb-3"
          title={translate(
            'This cluster was configured with a different topology than the offering now allows.',
          )}
        />
      )}
      <K8sKubernetesConfigSection
        defaultConfigs={defaultConfigs}
        kubernetesVersion={clusterConfig.kubernetes_version}
        onKubernetesVersionChange={handleKubernetesVersionChange}
        installLonghorn={clusterConfig.install_longhorn || false}
        onLonghornChange={handleLonghornChange}
        longhornDescription={
          topology === '3-datacenter'
            ? translate(
                'Automatically install Longhorn for cloud-native distributed block storage. Requires at least 3 storage nodes across all datacenters.',
              )
            : undefined
        }
        loadBalancer={clusterConfig.load_balancer}
        onLoadBalancerChange={handleLoadBalancerChange}
        topology={topology}
        onTopologyChange={
          topologyMode === 'customer_choice' ? handleTopologyChange : undefined
        }
        topologyNotice={
          topologyChanged
            ? providerFixed
              ? translate(
                  'Datacenters were reset for the new topology. Define the node groups again.',
                )
              : translate(
                  'Datacenters were reset for the new topology. Select the infrastructure and node groups again.',
                )
            : undefined
        }
      />

      {/* Datacenter configuration */}
      <K8sFormSection
        title={translate('Datacenter configuration')}
        topSeparator
      >
        {providerFixed ? (
          <K8sFixedSiteDatacenters
            offeringUuid={offeringUuid}
            optionName={optionName}
            topology={topology}
            topologyAllowed={topologyAllowed}
            datacenters={clusterConfig.datacenters}
            onChange={(datacenters) =>
              setClusterConfig((config) => ({ ...config, datacenters }))
            }
            defaultConfigs={defaultConfigs}
            loadBalancer={loadBalancer}
          />
        ) : (
          clusterConfig.datacenters.map((datacenter, index) => (
            <K8sDatacenterCard
              key={datacenter.id}
              datacenter={datacenter}
              index={index}
              topology={topology}
              onUpdate={(updatedDatacenter) =>
                updateDatacenter(index, updatedDatacenter)
              }
              availableInfrastructures={availableInfrastructures}
              loadingInfrastructures={loadingInfrastructures}
              defaultConfigs={defaultConfigs}
              loadBalancer={loadBalancer}
            />
          ))
        )}

        <K8sTotalResourcesCard
          totalResources={totalResources}
          datacenterCount={clusterConfig.datacenters.length}
          controllerTooltip={
            topology === '1-datacenter'
              ? translate('{n} in DC1', { n: 3 })
              : translate('{n} per DC', { n: 1 })
          }
          loadBalancerTooltip={
            !loadBalancer
              ? undefined
              : topology === '1-datacenter'
                ? translate('{n} in DC1', { n: 1 })
                : translate('{n} per DC', { n: 1 })
          }
        />
      </K8sFormSection>

      <K8sSecurityConfigSection
        publicAccessRules={clusterConfig.public_access_rules || []}
        onPublicAccessRulesChange={(rules) =>
          setClusterConfig({
            ...clusterConfig,
            public_access_rules: rules,
          })
        }
        administrativeAccessRules={
          clusterConfig.administrative_access_rules || []
        }
        onAdministrativeAccessRulesChange={(rules) =>
          setClusterConfig({
            ...clusterConfig,
            administrative_access_rules: rules,
          })
        }
        egressPolicy={defaultConfigs}
        egressRules={clusterConfig.egress_rules || []}
        onEgressRulesChange={(rules) =>
          setClusterConfig({
            ...clusterConfig,
            egress_rules: rules,
          })
        }
      />
    </K8sOptionCard>
  );
};
