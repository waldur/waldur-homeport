import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { useFormState } from 'react-final-form';
import { useToggle } from 'react-use';
import {
  openstackNetworksList,
  openstackPortsCreate,
  openstackSubnetsList,
} from 'waldur-js-client';

import { FormField, FormLabel, Switch } from 'waldur-ui';

import { getAllPages } from '@/core/api';
import { SHORT_STALE_TIME } from '@/core/constants';
import { isMatchPattern, required } from '@/core/validators';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { CustomIpFieldFinal as CustomIpField } from '@/openstack/openstack-instance/actions/update-internal-ips/CustomIpFieldFinal';
import { SubnetValueContainer } from '@/openstack/openstack-instance/deploy/FormNetworkSecurityStep';
import { formatSubnetName } from '@/openstack/openstack-instance/utils';
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
  change;
}> = ({
  networks,
  resource,
  subnets: subnetsProp,
  customIp = false,
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
              getOptionLabel={formatSubnetName}
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
            field: ['name', 'uuid', 'url'],
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
          type: 'select',
          options: networkOptions,
          validate: [required],
          required: true,
        },
        {
          name: 'fixed_ips',
          component: FixedIPsField,
          extraProps: { networks, resource },
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
          type: 'boolean',
        },
      ]}
    />
  );
};
