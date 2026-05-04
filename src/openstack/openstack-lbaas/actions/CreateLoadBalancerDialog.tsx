import { FC, useCallback } from 'react';
import { openstackLoadbalancersCreate } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { OpenStackTenant } from '@/openstack/openstack-tenant/types';
import { createLatinNameField } from '@/resource/actions/base';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { useNotify } from '@/store/notify';

import { subnetAutocomplete } from '../subnetAutocomplete';

export const CreateLoadBalancerDialog: FC<
  ActionDialogProps<OpenStackTenant>
> = ({ resolve: { resource, refetch } }) => {
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();

  const submitForm = useCallback(
    async (formData) => {
      const subnet = formData.vip_subnet;
      const subnetUuid = typeof subnet === 'object' ? subnet?.uuid : subnet;
      const vipSubnetUrl = `${ENV.apiEndpoint}api/openstack-subnets/${subnetUuid}/`;
      try {
        await openstackLoadbalancersCreate({
          body: {
            name: formData.name,
            tenant: resource.url,
            vip_subnet: vipSubnetUrl,
          },
        });
        showSuccess(translate('OpenStack load balancer has been created.'));
        closeDialog();
        if (refetch) {
          await refetch();
        }
      } catch (e) {
        showErrorResponse(
          e,
          translate('Unable to create OpenStack load balancer.'),
        );
      }
    },
    [closeDialog, refetch, resource.url, showErrorResponse, showSuccess],
  );

  return (
    <ResourceActionDialog
      dialogTitle={translate('Create load balancer')}
      submitForm={submitForm}
      formFields={[
        createLatinNameField(),
        {
          name: 'vip_subnet',
          label: translate('VIP subnet'),
          type: 'async_select',
          placeholder: translate('Select subnet...'),
          loadOptions: subnetAutocomplete(resource.uuid),
          defaultOptions: true,
          getOptionValue: (option) => option.uuid,
          getOptionLabel: (option) =>
            option.network_name
              ? `${option.name} (${option.cidr}) - ${option.network_name}`
              : `${option.name} (${option.cidr})`,
          noOptionsMessage: () => translate('No subnets'),
          isClearable: false,
          required: true,
        },
      ]}
    />
  );
};
