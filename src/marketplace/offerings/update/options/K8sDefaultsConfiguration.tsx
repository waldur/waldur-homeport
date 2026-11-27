import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Field, FieldRenderProps, useField } from 'react-final-form';
import {
  InfrastructureModeEnum,
  LoadBalancerModeEnum,
  marketplacePublicOfferingsList,
  TopologyModeEnum,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { MAX_PAGE_SIZE } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { required } from '@/core/validators';
import {
  BooleanGroup,
  FieldError,
  FormGroup,
  SelectField,
  StringGroup,
  NumberGroup,
  SelectGroup,
} from '@/form';
import { translate } from '@/i18n';
import {
  getAllowedTopologies,
  getDatacenterCount,
  getTopologyOptions,
  K8sClusterTopology,
  K8sDefaultConfiguration,
  validateFixedSites,
} from '@/marketplace/common/k8s-types';
import {
  K8sEgressRule,
  validateEgressRule,
} from '@/marketplace/common/k8sEgressRules';
import { K8sEgressRulesEditor } from '@/marketplace/common/K8sEgressRulesTable';
import { K8sFormSection } from '@/marketplace/common/K8sFormSection';

const getLoadBalancerModeOptions = (): Array<{
  value: LoadBalancerModeEnum;
  label: string;
}> => [
  { value: 'required', label: translate('Always included') },
  { value: 'optional', label: translate('Customer chooses') },
  { value: 'disabled', label: translate('Not offered') },
];

const getTopologyModeOptions = (): Array<{
  value: TopologyModeEnum;
  label: string;
}> => [
  { value: '1-datacenter', label: translate('Single site, 3 controllers') },
  {
    value: '3-datacenter',
    label: translate('Three sites, 1 controller each'),
  },
  { value: 'customer_choice', label: translate('Customer chooses') },
];

const getInfrastructureModeOptions = (): Array<{
  value: InfrastructureModeEnum;
  label: string;
}> => [
  { value: 'customer_choice', label: translate('Customer picks') },
  { value: 'provider_fixed', label: translate('Provider fixes the sites') },
];

type FixedSites = K8sDefaultConfiguration['fixed_openstack_offerings'];

/**
 * The OpenStack tenant offerings clusters may be deployed to: active or
 * paused ones the Kubernetes offering's organisation may use, its own or
 * shared with it, as the server requires (allowed_customer_uuid applies the
 * same rule).
 */
const useTenantOfferings = (customerUuid?: string) =>
  useQuery({
    queryKey: ['k8s-fixed-site-tenant-offerings', customerUuid],
    queryFn: () =>
      marketplacePublicOfferingsList({
        query: {
          type: ['OpenStack.Tenant'],
          state: ['Active', 'Paused'],
          allowed_customer_uuid: customerUuid,
          field: ['uuid', 'name', 'customer_name'],
          o: ['name'],
          page_size: MAX_PAGE_SIZE,
        },
      }).then((response) => response.data),
    staleTime: UI_STALE_TIME,
  });

const FixedSitesField = ({
  input,
  meta,
  topologies,
  customerUuid,
}: FieldRenderProps<FixedSites> & {
  topologies: K8sClusterTopology[];
  customerUuid?: string;
}) => {
  const { data, isLoading, error } = useTenantOfferings(customerUuid);
  const sites: FixedSites = input.value || {};
  const known = (data || []).map((offering) => ({
    value: offering.uuid,
    label: `${offering.name} (${offering.customer_name})`,
  }));
  const topologyLabels = Object.fromEntries(
    getTopologyOptions().map((option) => [option.value, option.label]),
  );

  const setSite = (topology: K8sClusterTopology, index: number, uuid) => {
    const list = Array.from(
      { length: getDatacenterCount(topology) },
      (_, i) => (i === index ? uuid : sites[topology]?.[i]) || null,
    );
    input.onChange({ ...sites, [topology]: list });
  };

  return (
    <>
      {error ? (
        <AlertItem
          type="floating"
          variant="error"
          className="mb-4"
          title={translate('Unable to load OpenStack tenant offerings.')}
        />
      ) : null}
      {topologies.map((topology) => {
        const count = getDatacenterCount(topology);
        return (
          <div key={topology} className="mb-4">
            <h6 className="text-secondary mb-2">{topologyLabels[topology]}</h6>
            {/* Full width: tenant offering names are long. */}
            <div className="grid grid-cols-1">
              {Array.from({ length: count }, (_, index) => {
                const value = sites[topology]?.[index] || null;
                // A stored site the provider no longer sees keeps its UUID.
                const options =
                  value && !known.some((option) => option.value === value)
                    ? [...known, { value, label: value }]
                    : known;
                const label =
                  count === 1
                    ? translate('Site')
                    : translate('Site {n}', { n: index + 1 });
                return (
                  <FormGroup key={index} label={label} required space={4}>
                    <SelectField
                      input={{
                        name: `${input.name}.${topology}.${index}`,
                        value,
                        onChange: (uuid) => setSite(topology, index, uuid),
                        onBlur: () => input.onBlur(),
                      }}
                      aria-label={`${topologyLabels[topology]}: ${label}`}
                      options={options}
                      placeholder={translate(
                        'Select OpenStack tenant offering...',
                      )}
                      isLoading={isLoading}
                      isClearable
                      simpleValue
                    />
                  </FormGroup>
                );
              })}
            </div>
          </div>
        );
      })}
      {meta.error ? <FieldError error={meta.error} /> : null}
    </>
  );
};

/**
 * Whether the customer or the provider picks the OpenStack infrastructure of
 * each site, and the provider's sites.
 */
const InfrastructureModeFields = ({
  name,
  customerUuid,
}: {
  name: string;
  // The organisation of the Kubernetes offering, whose tenant offerings the
  // sites must be.
  customerUuid?: string;
}) => {
  const {
    input: { value: infrastructureMode },
  } = useField<InfrastructureModeEnum>(`${name}.infrastructure_mode`, {
    subscription: { value: true },
  });
  const {
    input: { value: topologyMode },
  } = useField<TopologyModeEnum>(`${name}.topology_mode`, {
    subscription: { value: true },
  });
  const topologies = getAllowedTopologies({
    topology_mode: topologyMode || undefined,
  });
  return (
    <>
      <SelectGroup
        space={4}
        name={`${name}.infrastructure_mode`}
        label={translate('Site infrastructure')}
        description={translate(
          'Who picks the OpenStack tenant offering each site is deployed to. When not set, the customer picks.',
        )}
        options={getInfrastructureModeOptions()}
        placeholder={translate('Customer picks')}
        // Clearing hands the choice to the customer.
        isClearable
        parse={(value) => value || undefined}
        simpleValue
      />
      {infrastructureMode === 'provider_fixed' && (
        <>
          <p className="text-quaternary mb-3">
            {translate(
              'Clusters are deployed to these sites, in this order. Customers can only pick flavors that every site has.',
            )}
          </p>
          <Field
            name={`${name}.fixed_openstack_offerings`}
            component={FixedSitesField}
            topologies={topologies}
            customerUuid={customerUuid}
            validate={(value, allValues: any) => {
              const errors = validateFixedSites(
                value,
                allValues?.[name] as K8sDefaultConfiguration,
              );
              return errors.length ? errors : undefined;
            }}
          />
        </>
      )}
    </>
  );
};

const validateBaselineRules = (rules: K8sEgressRule[] | undefined) => {
  const errors = (rules || []).flatMap((rule, index) => {
    const error = validateEgressRule(rule, true);
    return error
      ? [
          translate('Baseline rule {name}: {error}', {
            name: rule.name?.trim() || index + 1,
            error,
          }),
        ]
      : [];
  });
  return errors.length ? errors : undefined;
};

const BaselineRulesField = ({ input, meta }) => (
  <>
    <K8sEgressRulesEditor
      rules={input.value || []}
      onChange={input.onChange}
      allowDomains
      emptyMessage={translate(
        'Destinations every restricted cluster needs, such as DNS, NTP, image registries and OS mirrors.',
      )}
    />
    {meta.error && (
      <div className="mt-2">
        <FieldError error={meta.error} />
      </div>
    )}
  </>
);

/** Whether customers may restrict outbound traffic, and to what. */
const EgressPolicySection = ({ name }: { name: string }) => {
  const {
    input: { value: enabled },
  } = useField<boolean>(`${name}.egress_rules_enabled`, {
    subscription: { value: true },
  });
  return (
    <K8sFormSection
      title={translate('Egress rules')}
      subtitle={translate(
        'Let customers restrict the outbound traffic of their clusters to a list of destinations. A cluster without egress rules keeps unrestricted outbound traffic.',
      )}
      topSeparator
    >
      <BooleanGroup
        name={`${name}.egress_rules_enabled`}
        label={translate('Customers may set egress rules')}
      />
      {enabled && (
        <>
          <BooleanGroup
            name={`${name}.egress_domain_rules_allowed`}
            label={translate('Allow domain name destinations')}
            description={translate(
              'Otherwise customers can list networks (CIDR) only. Enforcing domain rules needs a DNS-aware firewall or network policy.',
            )}
          />
          <h6 className="text-secondary mt-4 mb-1">
            {translate('Baseline destinations')}
          </h6>
          <p className="text-quaternary mb-3">
            {translate(
              'Always allowed once a cluster has egress rules, and shown to customers read-only.',
            )}
          </p>
          <Field
            name={`${name}.egress_baseline_rules`}
            component={BaselineRulesField}
            validate={validateBaselineRules}
          />
        </>
      )}
    </K8sFormSection>
  );
};

export const K8sDefaultsConfiguration: React.FC<{
  offering?: { customer_uuid?: string };
}> = ({ offering }) => {
  const name = 'default_configs';
  const {
    input: { value: loadBalancerMode },
  } = useField<LoadBalancerModeEnum>(`${name}.load_balancer_mode`, {
    subscription: { value: true },
  });
  return (
    <>
      <K8sFormSection
        title={translate('Default Kubernetes Infrastructure Sizing')}
        subtitle={translate(
          'Configure default resource allocations for controller nodes, load balancers, and storage volumes. These values will be used as defaults when users create new clusters.',
        )}
      >
        <AlertItem
          variant="info"
          type="floating"
          // Same 17.5px step the fields below use.
          className="mb-4"
          title={translate('Configuration Guide')}
          body={
            <>
              <p className="mb-1.5">
                {translate(
                  'To make this Kubernetes option fully functional, you need to configure:',
                )}
              </p>
              <ul className="mb-1.5">
                <li>
                  <strong>{translate('Kubernetes Versions')}</strong>{' '}
                  {translate('(Required - see section below)')}
                </li>
                <li>
                  <strong>{translate('Default Resource Sizing')}</strong>{' '}
                  {translate('(Optional - improves user experience)')}
                </li>
              </ul>
              <p className="mb-0">
                {translate(
                  'Without Kubernetes versions configured, users will see a warning and cannot create clusters.',
                )}
              </p>
            </>
          }
        />
        <SelectGroup
          space={4}
          name={`${name}.topology_mode`}
          label={translate('Cluster topology')}
          description={translate(
            'Where the controller nodes run: three in one site, or one in each of three sites. When not set, the customer chooses.',
          )}
          options={getTopologyModeOptions()}
          placeholder={translate('Customer chooses')}
          // Clearing hands the choice to the customer.
          isClearable
          parse={(value) => value || undefined}
          simpleValue
        />
        <InfrastructureModeFields
          name={name}
          customerUuid={offering?.customer_uuid}
        />
      </K8sFormSection>

      <K8sFormSection
        title={translate('Controller Node Defaults')}
        topSeparator
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
          <div>
            <NumberGroup
              space={4}
              label={translate('vCPUs per Controller')}
              tooltipEnd
              help={translate(
                'Number of vCPUs allocated to each controller node',
              )}
              name={`${name}.default_controller_vcpus`}
              type="number"
              min="1"
              max="16"
              parse={(value) => (value ? parseInt(value, 10) : undefined)}
            />
          </div>
          <div>
            <NumberGroup
              space={4}
              label={translate('RAM per Controller (GB)')}
              tooltipEnd
              help={translate(
                'Amount of RAM in GB allocated to each controller node',
              )}
              name={`${name}.default_controller_ram_gb`}
              type="number"
              min="1"
              max="64"
              parse={(value) => (value ? parseInt(value, 10) : undefined)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
          <div>
            <NumberGroup
              space={4}
              label={translate('System Disk per Controller (GB)')}
              tooltipEnd
              help={translate(
                'Size of system disk in GB for each controller node',
              )}
              name={`${name}.default_controller_system_disk_gb`}
              type="number"
              min="1"
              max="500"
              parse={(value) => (value ? parseInt(value, 10) : undefined)}
            />
          </div>
          <div>
            <NumberGroup
              space={4}
              label={translate('Data Disk per Controller (GB)')}
              tooltipEnd
              help={translate(
                'Size of data disk in GB for each controller node',
              )}
              name={`${name}.default_controller_etcd_disk_gb`}
              type="number"
              min="1"
              max="1000"
              parse={(value) => (value ? parseInt(value, 10) : undefined)}
            />
          </div>
        </div>
      </K8sFormSection>

      <K8sFormSection title={translate('Load Balancer Defaults')} topSeparator>
        <SelectGroup
          space={4}
          name={`${name}.load_balancer_mode`}
          label={translate('Load balancer nodes')}
          description={translate(
            'Whether clusters get dedicated load balancer nodes. Defaults to always included.',
          )}
          options={getLoadBalancerModeOptions()}
          placeholder={translate('Always included')}
          isClearable={false}
          simpleValue
        />
        {loadBalancerMode !== 'disabled' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
              <div>
                <NumberGroup
                  space={4}
                  label={translate('vCPUs per Load Balancer')}
                  tooltipEnd
                  help={translate(
                    'Number of vCPUs allocated to each load balancer node',
                  )}
                  name={`${name}.default_lb_vcpus`}
                  type="number"
                  min="1"
                  max="16"
                  parse={(value) => (value ? parseInt(value, 10) : undefined)}
                />
              </div>
              <div>
                <NumberGroup
                  space={4}
                  label={translate('RAM per Load Balancer (GB)')}
                  tooltipEnd
                  help={translate(
                    'Amount of RAM in GB allocated to each load balancer node',
                  )}
                  name={`${name}.default_lb_ram_gb`}
                  type="number"
                  min="1"
                  max="64"
                  parse={(value) => (value ? parseInt(value, 10) : undefined)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
              <div>
                <NumberGroup
                  space={4}
                  label={translate('System Disk per Load Balancer (GB)')}
                  tooltipEnd
                  help={translate(
                    'Size of system disk in GB for each load balancer node',
                  )}
                  name={`${name}.default_lb_system_disk_gb`}
                  type="number"
                  min="1"
                  max="500"
                  parse={(value) => (value ? parseInt(value, 10) : undefined)}
                />
              </div>
              <div>
                <NumberGroup
                  space={4}
                  label={translate('Data Disk per Load Balancer (GB)')}
                  tooltipEnd
                  help={translate(
                    'Size of data disk in GB for each load balancer node',
                  )}
                  name={`${name}.default_lb_logs_disk_gb`}
                  type="number"
                  min="1"
                  max="1000"
                  parse={(value) => (value ? parseInt(value, 10) : undefined)}
                />
              </div>
            </div>
          </>
        )}
      </K8sFormSection>

      <K8sFormSection
        title={translate('Worker Node Requirements')}
        topSeparator
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
          <div>
            <NumberGroup
              space={4}
              label={translate('Minimal vCPUs per Worker')}
              tooltipEnd
              help={translate(
                'Minimum number of vCPUs required for worker nodes when selecting flavors',
              )}
              name={`${name}.minimal_worker_vcpus`}
              type="number"
              min="1"
              max="16"
              parse={(value) => (value ? parseInt(value, 10) : undefined)}
            />
          </div>
          <div>
            <NumberGroup
              space={4}
              label={translate('Minimal RAM per Worker (GB)')}
              tooltipEnd
              help={translate(
                'Minimum amount of RAM in GB required for worker nodes when selecting flavors',
              )}
              name={`${name}.minimal_worker_ram_gb`}
              type="number"
              min="1"
              max="64"
              parse={(value) => (value ? parseInt(value, 10) : undefined)}
            />
          </div>
        </div>
      </K8sFormSection>

      <K8sFormSection title={translate('Default Volume Sizes')} topSeparator>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5">
          <div>
            <NumberGroup
              space={4}
              label={translate('Worker Data Disk (GB)')}
              tooltipEnd
              help={translate('Default size of data disk for worker nodes')}
              name={`${name}.default_worker_data_disk_gb`}
              type="number"
              min="1"
              max="10000"
              parse={(value) => (value ? parseInt(value, 10) : undefined)}
            />
          </div>
          <div>
            <NumberGroup
              space={4}
              label={translate('Storage Data Disk (GB)')}
              tooltipEnd
              help={translate('Default size of data disk for storage nodes')}
              name={`${name}.default_storage_data_disk_gb`}
              type="number"
              min="1"
              max="10000"
              parse={(value) => (value ? parseInt(value, 10) : undefined)}
            />
          </div>
          <div>
            <NumberGroup
              space={4}
              label={translate('Storage SAN Disk (GB)')}
              tooltipEnd
              help={translate(
                'Default size of virtual SAN disk for storage nodes',
              )}
              name={`${name}.default_storage_san_disk_gb`}
              type="number"
              min="1"
              max="50000"
              parse={(value) => (value ? parseInt(value, 10) : undefined)}
            />
          </div>
        </div>
      </K8sFormSection>

      <K8sFormSection
        title={translate('Kubernetes Version Configuration')}
        topSeparator
      >
        <div>
          <div>
            <StringGroup
              space={4}
              required
              label={translate('Available Kubernetes Versions')}
              tooltipEnd
              help={translate(
                'Enter comma-separated list of Kubernetes versions (e.g., 1.32.0,1.33.0,1.34.0). This controls which versions users can select when creating clusters.',
              )}
              validate={(value) =>
                required(value) &&
                translate(
                  'Users cannot create clusters until Kubernetes versions are configured.',
                )
              }
              name={`${name}.available_kubernetes_versions`}
              placeholder="1.32.0,1.33.0,1.34.0"
            />
          </div>
        </div>
      </K8sFormSection>

      <EgressPolicySection name={name} />
    </>
  );
};
