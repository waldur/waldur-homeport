import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  OpenStackPort,
  openstackPortsUpdatePortIp,
  openstackSubnetsList,
} from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { SHORT_STALE_TIME } from '@/core/constants';
import { translate } from '@/i18n';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

import { FixedIPsField } from './CreatePortDialog';

export const UpdatePortDialog: FC<ActionDialogProps<OpenStackPort>> = ({
  resolve: { resource, refetch },
}) => {
  const {
    data: subnets,
    isLoading,
    error,
    refetch: refetchSubnets,
  } = useQuery({
    queryKey: ['port-form-subnets', resource?.network_uuid],

    queryFn: () => {
      if (!resource.network_uuid) return Promise.resolve([]);
      return getAllPages((page) =>
        openstackSubnetsList({
          query: {
            page,
            tenant_uuid: resource.tenant_uuid,
            network_uuid: resource.network_uuid,
          },
        }),
      );
    },

    staleTime: SHORT_STALE_TIME,
  });

  const initialValues = useMemo(() => {
    if (subnets) {
      const subnet = subnets.find(
        (sub) => sub.backend_id === resource.fixed_ips[0].subnet_id,
      );
      if (subnet) {
        return {
          fixed_ips: {
            fixed_ip: resource.fixed_ips[0].ip_address,
            subnet,
          },
        };
      }
    }
    return {};
  }, [subnets, resource]);

  const mutation = useManagedMutation<
    any,
    any,
    {
      fixed_ips: { subnet: { url: string }; fixed_ip?: string };
    }
  >({
    mutationFn: (formData) =>
      openstackPortsUpdatePortIp({
        path: { uuid: resource.uuid },
        body: {
          subnet: formData.fixed_ips.subnet.url,
          ip_address: formData.fixed_ips?.fixed_ip,
        },
      }),
    successMessage: translate('Port has been updated.'),
    errorMessage: translate('Unable to update port.'),
    refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Update port IP')}
      dialogSubtitle={
        <ScopeSubtitle label={translate('Port name')} name={resource.name} />
      }
      loading={isLoading}
      error={error}
      refetch={refetchSubnets}
      submitForm={mutation.mutateAsync}
      initialValues={initialValues}
      dialogSubmitLabel={translate('Save')}
      formFields={[
        {
          name: 'fixed_ips',
          component: FixedIPsField,
          extraProps: {
            subnets,
            customIp: !!resource.fixed_ips?.[0]?.ip_address,
          },
        },
      ]}
    />
  );
};
