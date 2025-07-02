import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { change } from 'redux-form';
import { OpenStackPort, openstackPortsUpdatePortIp } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { loadSubnets } from '@waldur/openstack/api';
import { RESOURCE_ACTION_FORM } from '@waldur/resource/actions/constants';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

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

    staleTime: 60 * 1000,
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

  const submitForm = useCallback(
    async (formData) => {
      const body = {
        subnet: formData.fixed_ips.subnet.url,
        ip_address: formData.fixed_ips?.fixed_ip,
      };

      try {
        await openstackPortsUpdatePortIp({
          path: { uuid: resource.uuid },
          body,
        });
        dispatch(showSuccess(translate('Port has been updated.')));
        dispatch(closeModalDialog());
        if (refetch) {
          await refetch();
        }
      } catch (e) {
        dispatch(showErrorResponse(e, translate('Unable to update port.')));
      }
    },
    [dispatch, refetch, resource],
  );

  return (
    <ResourceActionDialog
      dialogTitle={translate('Update port IP')}
      loading={isLoading}
      error={error}
      refetch={refetchSubnets}
      submitForm={submitForm}
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
