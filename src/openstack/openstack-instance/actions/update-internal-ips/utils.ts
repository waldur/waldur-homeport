import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { loadSubnets, updateInternalIps } from '@waldur/openstack/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { OpenStackInstance } from '../../types';
import { formatSubnet } from '../../utils';

interface UpdateInternalIpsFormData {
  internal_ips_set: { value: string; label: string }[];
}

export const useUpdateInternalIpsForm = (resource: OpenStackInstance) => {
  const asyncState = useAsync(
    () =>
      loadSubnets(resource.service_settings_uuid).then((subnets) =>
        subnets.map((subnet) => ({
          label: formatSubnet(subnet),
          value: subnet.url,
        })),
      ),
    [resource.service_settings_uuid],
  );
  const dispatch = useDispatch();
  const submitRequest = async (formData: UpdateInternalIpsFormData) => {
    try {
      await updateInternalIps(resource.uuid, {
        internal_ips_set: formData.internal_ips_set.map((item) => ({
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
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('Unable to update internal IPs of OpenStack instance.'),
        ),
      );
    }
  };
  const initialValues = useMemo<UpdateInternalIpsFormData>(
    () => ({
      internal_ips_set: resource.internal_ips_set.map((item) => ({
        value: item.subnet,
        label: formatSubnet({ name: item.subnet_name, cidr: item.subnet_cidr }),
      })),
    }),
    [resource.internal_ips_set],
  );
  return { resource, asyncState, submitRequest, initialValues };
};

const FORM_NAME = 'UpdateInternalIps';

type UpdateInternalIpsOwnProps = ReturnType<typeof useUpdateInternalIpsForm>;

export const connectForm = reduxForm<
  UpdateInternalIpsFormData,
  UpdateInternalIpsOwnProps
>({
  form: FORM_NAME,
});
