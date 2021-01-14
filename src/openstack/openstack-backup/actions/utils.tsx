import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import { formValueSelector, reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import {
  loadFlavors,
  loadSecurityGroups,
  loadFloatingIps,
  loadSubnets,
  restoreBackup,
  BackupRestoreRequestBody,
} from '@waldur/openstack/api';
import {
  formatFlavorTitle,
  formatSubnet,
} from '@waldur/openstack/openstack-instance/utils';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';

import { OpenStackBackup } from '../types';

export const AUTO_ASSIGN_FLOATING_IP = 'AUTO_ASSIGN_FLOATING_IP';

export const SKIP_FLOATING_IP_ASSIGNMENT = 'SKIP_FLOATING_IP_ASSIGNMENT';

interface Option {
  label: string;
  value: string;
}

export interface BackupFormChoices {
  securityGroups: Option[];
  flavors: Option[];
  subnets: Option[];
  floatingIps: Option[];
}

export interface BackupNetworkType {
  subnet: string;
  floating_ip: string;
}

interface BackupRestoreFormData {
  flavor: Option;
  security_groups: Option[];
  networks: BackupNetworkType[];
}

const loadData = async (
  resource: OpenStackBackup,
): Promise<BackupFormChoices> => {
  const [flavors, securityGroups, floatingIps, subnets] = await Promise.all([
    loadFlavors(resource.service_settings_uuid),
    loadSecurityGroups(resource.service_settings_uuid),
    loadFloatingIps(resource.service_settings_uuid),
    loadSubnets(resource.service_settings_uuid),
  ]);

  return {
    securityGroups: securityGroups.map((choice) => ({
      value: choice.url,
      label: choice.name,
    })),
    flavors: flavors.map((flavor) => ({
      label: formatFlavorTitle(flavor),
      value: flavor.url,
    })),
    subnets: [
      {
        label: translate('Select connected subnet'),
        value: '',
      },
      ...subnets.map((subnet) => ({
        label: formatSubnet(subnet),
        value: subnet.url,
      })),
    ],
    floatingIps: [
      {
        value: SKIP_FLOATING_IP_ASSIGNMENT,
        label: translate('Skip floating IP assignment'),
      },
      {
        value: AUTO_ASSIGN_FLOATING_IP,
        label: translate('Auto-assign floating IP'),
      },
      ...floatingIps.map((floating_ip) => ({
        label: floating_ip.address,
        value: floating_ip.url,
      })),
    ],
  };
};

const getInitialValues = (
  resource: OpenStackBackup,
): Partial<BackupRestoreFormData> => ({
  security_groups: resource.instance_security_groups.map((choice) => ({
    value: choice.url,
    label: choice.name,
  })),
  networks: resource.instance_internal_ips_set
    ? resource.instance_internal_ips_set.map((item) => ({
        floating_ip: SKIP_FLOATING_IP_ASSIGNMENT,
        subnet: item.subnet,
      }))
    : [],
});

const serializeBackupRestoreFormData = (
  form: BackupRestoreFormData,
): BackupRestoreRequestBody => ({
  flavor: form.flavor.value,
  internal_ips_set: form.networks
    .filter((item) => item.subnet)
    .map((item) => ({
      subnet: item.subnet,
    })),
  floating_ips: form.networks
    .filter(
      (item) => item.subnet && item.floating_ip !== SKIP_FLOATING_IP_ASSIGNMENT,
    )
    .map((item) => {
      // Auto-assign floating IP
      if (item.floating_ip === AUTO_ASSIGN_FLOATING_IP) {
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
  security_groups: form.security_groups.map(({ value }) => ({
    url: value,
  })),
});

export const useBackupRestoreForm = (resource: OpenStackBackup) => {
  const asyncState = useAsync(() => loadData(resource), [resource]);
  const dispatch = useDispatch();

  const submitRequest = async (formData: BackupRestoreFormData) => {
    try {
      await restoreBackup(
        resource.uuid,
        serializeBackupRestoreFormData(formData),
      );
      dispatch(
        showSuccess(translate('VM snapshot restoration has been scheduled.')),
      );
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to restore VM snapshot.')),
      );
    }
  };
  return {
    resource: resource,
    asyncState: asyncState,
    submitRequest: submitRequest,
    initialValues: getInitialValues(resource),
  };
};

const FORM_NAME = 'BackupRestoreForm';

type BackupRestoreOwnProps = ReturnType<typeof useBackupRestoreForm>;

export const connectBackupRestoreForm = reduxForm<
  BackupRestoreFormData,
  BackupRestoreOwnProps
>({
  form: FORM_NAME,
});

export const getNetworkSelector = (name: string) => (state: RootState) =>
  formValueSelector(FORM_NAME)(state, name) as BackupNetworkType;

export const getAllNetworksSelector = (state: RootState) =>
  formValueSelector(FORM_NAME)(state, 'networks') as BackupNetworkType[];

export function hasFreeSubnets(
  subnets: Option[],
  networks: BackupNetworkType[],
) {
  return (
    subnets.length - 1 > networks.filter((network) => network.subnet).length
  );
}

export function getFreeSubnets(
  subnets: Option[],
  networks: BackupNetworkType[],
  currentNetwork: BackupNetworkType,
): Option[] {
  const usedSubnets = {};
  networks.forEach((network) => {
    if (network.subnet) {
      usedSubnets[network.subnet] = true;
    }
  });
  return subnets.filter(
    (subnet) =>
      !usedSubnets[subnet.value] || subnet.value === currentNetwork.subnet,
  );
}

export function getFreeFloatingIps(
  floatingIps: Option[],
  networks: BackupNetworkType[],
  currentNetwork: BackupNetworkType,
): Option[] {
  const usedFloatingIps = {};
  networks.forEach((network) => {
    if (
      network.floating_ip &&
      network.floating_ip !== AUTO_ASSIGN_FLOATING_IP
    ) {
      usedFloatingIps[network.floating_ip] = true;
    }
  });
  return floatingIps.filter(
    (floatingIp) =>
      !usedFloatingIps[floatingIp.value] ||
      floatingIp.value === currentNetwork.floating_ip,
  );
}
