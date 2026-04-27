import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import { reduxForm } from 'redux-form';
import { openstackInstancesUpdatePorts } from 'waldur-js-client';
import { OpenStackInstance } from 'waldur-js-client';

import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { loadSubnets } from '@/openstack/api';
import { showErrorResponse, showSuccess } from '@/store/notify';

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
  const dispatch = useDispatch();
  const submitRequest = async (formData: UpdatePortsFormData) => {
    try {
      await openstackInstancesUpdatePorts({
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
      });
      dispatch(
        showSuccess(
          translate(
            'Update of OpenStack instance internal IPs has been scheduled.',
          ),
        ),
      );
      dispatch(closeModalDialog());
      await refetch();
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('Unable to update internal IPs of OpenStack instance.'),
        ),
      );
    }
  };

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
