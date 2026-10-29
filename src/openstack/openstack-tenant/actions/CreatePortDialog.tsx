import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useMemo, useRef } from 'react';
import { useForm, useFormState } from 'react-final-form';
import { useToggle } from 'react-use';
import {
  openstackNetworksList,
  openstackPortsCreate,
  openstackSubnetsList,
} from 'waldur-js-client';

import { FormField, FormLabel, Switch } from 'waldur-ui';

import { getAllPages } from '@/core/api';
import { SHORT_STALE_TIME } from '@/core/constants';
import { getUUID } from '@/core/utils';
import { isMatchPattern, required } from '@/core/validators';
import { BooleanGroup, SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { CustomIpFieldFinal as CustomIpField } from '@/openstack/openstack-instance/actions/update-internal-ips/CustomIpFieldFinal';
import {
  renderSubnetOption,
  SubnetValueContainer,
} from '@/openstack/openstack-instance/deploy/FormNetworkSecurityStep';
import { SharedByLabel } from '@/openstack/openstack-instance/SharedByLabel';
import {
  formatSharedBy,
  formatSubnet,
} from '@/openstack/openstack-instance/utils';
import {
  createDescriptionField,
  createLatinNameField,
} from '@/resource/actions/base';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

const MAC_ADDRESS_PATTERN = new RegExp(
  '^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$',
  'gm',
);

const macAddressValidator = (value) =>
  isMatchPattern(
    MAC_ADDRESS_PATTERN,
    translate('Please enter a valid mac address'),
  )(value);

export const FixedIPsField: FC<{
  networks?: any[];
  resource?: any;
  subnets?: any[];
  customIp?: boolean;
  tenantUuid: string;
  change;
}> = ({
  networks,
  resource,
  subnets: subnetsProp,
  customIp = false,
  tenantUuid,
  change,
}) => {
  const [customIpEnabled, setCustomIpEnabled] = useToggle(customIp);
  const { values } = useFormState();
  const network = values.network;
  const fixedIps = values.fixed_ips;

  const { data: subnetsFetched } = useQuery({
    queryKey: ['port-form-subnets', resource?.uuid, network],

    queryFn: () => {
      if (!network || !resource) return Promise.resolve([]);
      const networkObj = networks?.find((net) => net.url === network);
      if (!networkObj) return Promise.resolve([]);
      return getAllPages((page) =>
        openstackSubnetsList({
          query: {
            page,
            tenant_uuid: resource.uuid,
            network_uuid: networkObj.uuid,
          },
        }),
      );
    },
    enabled: !subnetsProp && Boolean(networks && network && resource),
    staleTime: SHORT_STALE_TIME,
  });

  const subnets = subnetsProp || subnetsFetched;

  const toggleCustomIp = (value) => {
    setCustomIpEnabled(value);
    if (!value) {
      change('fixed_ips.fixed_ip', undefined);
    }
  };

  return (
    <FormField>
      <div className="flex justify-between mb-4">
        <FormLabel className="mb-0">{translate('Fixed IPs')}</FormLabel>
        <Switch
          checked={customIpEnabled}
          onCheckedChange={toggleCustomIp}
          size="sm"
          className="self-center"
          label={translate('Custom IP configuration')}
        />
      </div>
      <div className="border-rows mb-3">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <SelectGroup
              name="fixed_ips.subnet"
              label={translate('Subnet')}
              options={subnets || []}
              placeholder={translate('Select subnet')}
              getOptionValue={(option) => option.url}
              getOptionLabel={formatSubnet}
              formatOptionLabel={renderSubnetOption(tenantUuid)}
              noUpdateOnBlur
              spaceless
              components={{ ValueContainer: SubnetValueContainer }}
            />
          </div>
          {customIpEnabled && fixedIps && (
            <div>
              <CustomIpField parentName="fixed_ips" data={fixedIps} autoFocus />
            </div>
          )}
        </div>
      </div>
    </FormField>
  );
};

const NetworkField: FC<{
  name: string;
  options: any[];
  tenantUuid: string;
  change;
  [key: string]: any;
}> = ({ options, tenantUuid, ...props }) => {
  // The dialog passes every field the form's change function; a select has no use for it.
  const { change: _change, ...selectProps } = props;
  return (
    <SelectGroup
      {...selectProps}
      options={options}
      simpleValue={true}
      formatOptionLabel={(option) => (
        <SharedByLabel
          label={option.label}
          sharedBy={formatSharedBy(option, tenantUuid)}
        />
      )}
    />
  );
};

// Only the owner of a network shared with the tenant may turn port security
// off on it, so a port on such a network starts with it on. Back on a network
// of the tenant's own, the default returns unless it was the user's choice.
const PortSecurityField: FC<{
  name: string;
  networks?: any[];
  tenantUuid: string;
  change;
  [key: string]: any;
}> = ({ networks, tenantUuid, change, ...props }) => {
  const form = useForm();
  const { values } = useFormState();
  const network = networks?.find((item) => item.url === values.network);
  const isShared = Boolean(
    network?.tenant && getUUID(network.tenant) !== tenantUuid,
  );
  const ticked = useRef(false);

  useEffect(() => {
    const enabled = form.getFieldState('port_security_enabled')?.value;
    if (isShared && !enabled) {
      change('port_security_enabled', true);
      ticked.current = true;
    } else if (!isShared && ticked.current) {
      if (enabled) {
        change('port_security_enabled', false);
      }
      ticked.current = false;
    }
  }, [isShared, change, form]);

  return (
    <BooleanGroup
      {...props}
      hideLabel={true}
      description={
        isShared
          ? translate(
              'Only the owner of a shared network can turn port security off on it.',
            )
          : undefined
      }
    />
  );
};

export const CreatePortDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const {
    data: networks,
    error: errorNetworks,
    isLoading: isLoadingNetworks,
    refetch: refetchNetworks,
  } = useQuery({
    queryKey: ['port-form-networks', resource.uuid],

    queryFn: () =>
      getAllPages((page) =>
        openstackNetworksList({
          query: {
            page,
            tenant_uuid: resource.uuid,
            field: [
              'name',
              'uuid',
              'url',
              'tenant',
              'tenant_name',
              'tenant_is_managed',
            ],
          },
        }),
      ),

    staleTime: SHORT_STALE_TIME,
  });

  const networkOptions = useMemo(
    () =>
      networks?.length
        ? networks.map((network) => ({
            label: network.name,
            value: network.url,
            tenant: network.tenant,
            tenant_name: network.tenant_name,
            tenant_is_managed: network.tenant_is_managed,
          }))
        : [],
    [networks],
  );

  const mutation = useManagedMutation<
    any,
    any,
    {
      name: string;
      description?: string;
      network: string;
      fixed_ips?: { subnet: { backend_id: string }; fixed_ip?: string };
      mac_address?: string;
      port_security_enabled?: boolean;
    }
  >({
    mutationFn: (formData) => {
      let fixed_ips;
      if (formData.fixed_ips) {
        fixed_ips = [
          {
            subnet_id: formData.fixed_ips.subnet.backend_id,
            ip_address: formData.fixed_ips?.fixed_ip,
          },
        ];
      }

      return openstackPortsCreate({
        body: {
          ...formData,
          fixed_ips,
          port_security_enabled: formData.port_security_enabled || false,
          target_tenant: resource.url,
        },
      });
    },
    successMessage: translate('OpenStack network port has been created.'),
    errorMessage: translate('Unable to create OpenStack network port.'),
    refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Create port for OpenStack network')}
      dialogSubtitle={
        <ScopeSubtitle label={translate('Network name')} name={resource.name} />
      }
      loading={isLoadingNetworks}
      error={errorNetworks}
      refetch={refetchNetworks}
      submitForm={mutation.mutateAsync}
      formFields={[
        createLatinNameField(),
        createDescriptionField(),
        {
          name: 'network',
          label: translate('Network'),
          component: NetworkField,
          extraProps: { options: networkOptions, tenantUuid: resource.uuid },
          validate: [required],
          required: true,
        },
        {
          name: 'fixed_ips',
          component: FixedIPsField,
          extraProps: { networks, resource, tenantUuid: resource.uuid },
        },
        {
          name: 'mac_address',
          label: translate('MAC address'),
          type: 'string',
          validate: [macAddressValidator],
        },
        {
          name: 'port_security_enabled',
          label: translate('Port security enabled'),
          component: PortSecurityField,
          extraProps: { networks, tenantUuid: resource.uuid },
        },
      ]}
    />
  );
};
