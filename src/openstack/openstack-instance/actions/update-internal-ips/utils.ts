import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { loadSubnets, updatePorts } from '@waldur/openstack/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { OpenStackInstance } from '../../types';
import { formatSubnet } from '../../utils';

interface UpdatePortsFormData {
  ports: { value: string; label: string }[];
}

export const useUpdatePortsForm = (resource: OpenStackInstance, refetch) => {
  const asyncState = useAsync(
    () =>
      loadSubnets({ tenant_uuid: resource.tenant_uuid }).then((subnets) =>
        subnets.map((subnet) => ({
          label: formatSubnet(subnet),
          value: subnet.url,
        })),
      ),
    [resource.tenant_uuid],
  );
  const dispatch = useDispatch();
  const submitRequest = async (formData: UpdatePortsFormData) => {
    try {
      await updatePorts(resource.uuid, {
        ports: formData.ports.map((item) => ({
          subnet: item.value,
        })),
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
  const initialValues = useMemo<UpdatePortsFormData>(
    () => ({
      ports: resource.ports.map((item) => ({
        value: item.subnet,
        label: formatSubnet({ name: item.subnet_name, cidr: item.subnet_cidr }),
      })),
    }),
    [resource.ports],
  );
  return { resource, asyncState, submitRequest, initialValues };
};

const FORM_NAME = 'UpdateInternalIps';

type UpdateInternalIpsOwnProps = ReturnType<typeof useUpdatePortsForm>;

export const connectForm = reduxForm<
  UpdatePortsFormData,
  UpdateInternalIpsOwnProps
>({
  form: FORM_NAME,
});
