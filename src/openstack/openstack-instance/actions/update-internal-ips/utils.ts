import { useMemo } from 'react';
import { useAsync } from 'react-use';
import { reduxForm } from 'redux-form';
import { openstackInstancesUpdatePorts } from 'waldur-js-client';
import { OpenStackInstance } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { loadSubnets } from '@/openstack/api';

interface PortFormEntry {
  subnet: any;
  fixed_ip?: string;
}

interface UpdatePortsFormData {
  ports: PortFormEntry[];
}

export const useUpdatePortsForm = (resource: OpenStackInstance, refetch) => {
  const asyncState = useAsync(
    () => loadSubnets({ tenant_uuid: resource.tenant_uuid }),
    [resource.tenant_uuid],
  );
  const updateMutation = useManagedMutation<any, any, UpdatePortsFormData>({
    mutationFn: (formData) =>
      openstackInstancesUpdatePorts({
        path: { uuid: resource.uuid },
        body: {
          ports: formData.ports.map((item) => {
            const port: any = {
              subnet: item.subnet.url,
            };
            if (item.fixed_ip) {
              port.fixed_ips = [
                {
                  ip_address: item.fixed_ip,
                  subnet_id: item.subnet.backend_id,
                },
              ];
            }
            return port;
          }),
        },
      }),
    successMessage: translate(
      'Update of OpenStack instance internal IPs has been scheduled.',
    ),
    errorMessage: translate(
      'Unable to update internal IPs of OpenStack instance.',
    ),
    refetch,
  });

  const submitRequest = (formData: UpdatePortsFormData) =>
    updateMutation.mutateAsync(formData);

  // Build initial values by matching current ports to full subnet objects
  const initialValues = useMemo<UpdatePortsFormData>(() => {
    const subnets = asyncState.value;
    return {
      ports: resource.ports.map((item) => {
        // Use full subnet object from the loaded list for backend_id/allocation_pools
        const fullSubnet = subnets?.find((s) => s.uuid === item.subnet_uuid);
        return {
          subnet: fullSubnet || {
            url: item.subnet,
            name: item.subnet_name,
            cidr: item.subnet_cidr,
            uuid: item.subnet_uuid,
          },
          fixed_ip: item.fixed_ips?.[0]?.ip_address,
        };
      }),
    };
  }, [resource.ports, asyncState.value]);

  return { resource, asyncState, submitRequest, initialValues };
};

const FORM_NAME = 'UpdateInternalIps';

type UpdateInternalIpsOwnProps = ReturnType<typeof useUpdatePortsForm>;

export const connectForm = reduxForm<
  UpdatePortsFormData,
  UpdateInternalIpsOwnProps
>({
  form: FORM_NAME,
  enableReinitialize: true,
});
