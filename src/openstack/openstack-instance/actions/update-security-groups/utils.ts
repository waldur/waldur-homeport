import { useMemo } from 'react';
import { useAsync } from 'react-use';
import { reduxForm } from 'redux-form';
import {
  openstackInstancesUpdateSecurityGroups,
  OpenStackPort,
  openstackPortsUpdateSecurityGroups,
} from 'waldur-js-client';
import { OpenStackInstance } from 'waldur-js-client';

import { translate } from '@/i18n';
import { Option } from '@/marketplace/common/registry';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { loadSecurityGroups } from '@/openstack/api';
import { OPENSTACK_PORT_TYPE } from '@/openstack/constants';

interface UpdateSecurityGroupsFormData {
  security_groups: Option[];
}

export const useUpdateSecurityGroupsForm = (
  resource: OpenStackInstance | OpenStackPort,
  refetch?,
) => {
  const asyncState = useAsync(
    () =>
      loadSecurityGroups({
        tenant_uuid: resource.tenant_uuid,
        field: ['name', 'url'],
      }).then((groups) =>
        groups.map((group) => ({
          label: group.name,
          value: group.url,
        })),
      ),
    [resource.service_settings_uuid],
  );
  const resourceLabel =
    resource.resource_type === OPENSTACK_PORT_TYPE
      ? translate('OpenStack port')
      : translate('OpenStack instance');

  const updateMutation = useManagedMutation<
    any,
    any,
    UpdateSecurityGroupsFormData
  >({
    mutationFn: (formData) => {
      const api =
        resource.resource_type === OPENSTACK_PORT_TYPE
          ? openstackPortsUpdateSecurityGroups
          : openstackInstancesUpdateSecurityGroups;
      return api({
        path: { uuid: resource.uuid },
        body: {
          security_groups: (formData.security_groups || []).map(
            (item) => item.value,
          ),
        },
      });
    },
    successMessage: translate(
      'Update of {resource} security groups has been scheduled.',
      { resource: resourceLabel },
    ),
    errorMessage: translate('Unable to update security groups of {resource}.', {
      resource: resourceLabel,
    }),
    refetch,
  });

  const submitRequest = (formData: UpdateSecurityGroupsFormData) =>
    updateMutation.mutateAsync(formData);
  const initialValues = useMemo<UpdateSecurityGroupsFormData>(
    () => ({
      security_groups: resource.security_groups.map((group) => ({
        label: group.name,
        value: group.url,
      })),
    }),
    [],
  );
  return { resource, asyncState, submitRequest, initialValues };
};

const FORM_NAME = 'UpdateSecurityGroups';

type UpdateSecurityGroupsOwnProps = ReturnType<
  typeof useUpdateSecurityGroupsForm
>;

export const connectForm = reduxForm<
  UpdateSecurityGroupsFormData,
  UpdateSecurityGroupsOwnProps
>({
  form: FORM_NAME,
});
