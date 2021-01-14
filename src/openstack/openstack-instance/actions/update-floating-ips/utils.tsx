import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import { formValueSelector, reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { loadFloatingIps, setFloatingIps } from '@waldur/openstack/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';

import { OpenStackInstance } from '../../types';
import { formatSubnet } from '../../utils';

interface FloatingIpPair {
  floating_ip: string | boolean;
  subnet: string;
  address: string;
  subnet_name: string;
}

interface FloatingIPsFormData {
  floating_ips: FloatingIpPair[];
}

export const useFloatingIpsEditor = (resource: OpenStackInstance) => {
  const asyncState = useAsync(
    () =>
      loadFloatingIps(resource.service_settings_uuid).then((floatingIps) => [
        {
          value: true,
          label: translate('Auto-assign floating IP'),
        },
        ...floatingIps.map((item) => ({
          label: item.address,
          value: item.url,
        })),
      ]),
    [resource.service_settings_uuid],
  );

  const subnets = useMemo(
    () => [
      { value: '', label: translate('Select connected subnet') },
      ...resource.internal_ips_set.map((internal_ip) => ({
        value: internal_ip.subnet,
        label: formatSubnet({
          name: internal_ip.subnet_name,
          cidr: internal_ip.subnet_cidr,
        }),
      })),
    ],
    [resource.internal_ips_set],
  );

  const initialValues = useMemo<FloatingIPsFormData>(
    () => ({
      floating_ips: resource.floating_ips.map((floating_ip) => ({
        address: floating_ip.address,
        floating_ip: floating_ip.url,
        subnet: floating_ip.subnet,
        subnet_name: floating_ip.subnet_name,
      })),
    }),
    [resource.floating_ips],
  );

  const dispatch = useDispatch();

  const submitRequest = async (formData: FloatingIPsFormData) => {
    try {
      await setFloatingIps(resource.uuid, {
        floating_ips: formData.floating_ips
          .filter((item) => item.subnet)
          .map((item) => {
            if (item.floating_ip === true) {
              return {
                subnet: item.subnet,
              };
            } else {
              return {
                subnet: item.subnet,
                url: item.floating_ip,
              };
            }
          }),
      });
      dispatch(
        showSuccess(translate('Floating IPs update has been scheduled.')),
      );
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to update floating IPs.')),
      );
    }
  };
  return { asyncState, initialValues, subnets, submitRequest, resource };
};

const FORM_NAME = 'updateFloatingIPs';

type FloatingIPsOwnProps = ReturnType<typeof useFloatingIpsEditor>;

export const connectForm = reduxForm<FloatingIPsFormData, FloatingIPsOwnProps>({
  form: FORM_NAME,
});

export const getPairSelector = (name: string) => (state: RootState) =>
  formValueSelector(FORM_NAME)(state, name) as FloatingIpPair;
