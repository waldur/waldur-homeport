import { useQuery } from '@tanstack/react-query';
import { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { change } from 'redux-form';
import { OpenStackPort, openstackPortsUpdatePortIp } from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { loadSubnets } from '@/openstack/api';
import { RESOURCE_ACTION_FORM } from '@/resource/actions/constants';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

import { FixedIPsField } from './CreatePortDialog';

export const UpdatePortDialog: FC<ActionDialogProps<OpenStackPort>> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();

  const {
    data: subnets,
    isLoading,
    error,
    refetch: refetchSubnets,
  } = useQuery({
    queryKey: ['port-form-subnets', resource?.network_uuid],

    queryFn: () => {
      if (!resource.network_uuid) return Promise.resolve([]);
      return loadSubnets({
        tenant_uuid: resource.tenant_uuid,
        network_uuid: resource.network_uuid,
      });
    },

    staleTime: SHORT_STALE_TIME,
  });

  useEffect(() => {
    if (subnets) {
      const subnet = subnets.find(
        (sub) => sub.backend_id === resource.fixed_ips[0].subnet_id,
      );
      if (subnet) {
        dispatch(
          change(RESOURCE_ACTION_FORM, 'fixed_ips', {
            fixed_ip: resource.fixed_ips[0].ip_address,
            subnet,
          }),
        );
      }
    }
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
      loading={isLoading}
      error={error}
      refetch={refetchSubnets}
      submitForm={mutation.mutateAsync}
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
