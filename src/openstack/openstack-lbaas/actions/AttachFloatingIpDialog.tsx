import { FC, useCallback } from 'react';
import {
  OpenStackLoadBalancer,
  openstackLoadbalancersAttachFloatingIp,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { useNotify } from '@/store/notify';

import { floatingIpAutocomplete } from '../floatingIpAutocomplete';

export const AttachFloatingIpDialog: FC<
  ActionDialogProps<OpenStackLoadBalancer>
> = ({ resolve: { resource, refetch } }) => {
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();

  const submitForm = useCallback(
    async (formData) => {
      try {
        const floatingIp = formData.floating_ip;
        const floatingIpUrl =
          typeof floatingIp === 'object' ? floatingIp.url : floatingIp;
        await openstackLoadbalancersAttachFloatingIp({
          path: { uuid: resource.uuid },
          body: { floating_ip: floatingIpUrl },
        });
        showSuccess(translate('Floating IP is being attached.'));
        closeDialog();
        if (refetch) await refetch();
      } catch (e) {
        showErrorResponse(e, translate('Unable to attach floating IP.'));
      }
    },
    [closeDialog, refetch, resource, showErrorResponse, showSuccess],
  );

  return (
    <ResourceActionDialog
      dialogTitle={translate('Attach floating IP')}
      submitForm={submitForm}
      formFields={[
        {
          name: 'floating_ip',
          label: translate('Floating IP'),
          type: 'async_select',
          placeholder: translate('Select floating IP...'),
          loadOptions: floatingIpAutocomplete(resource.tenant_uuid),
          defaultOptions: true,
          getOptionValue: (option) => option.uuid,
          getOptionLabel: (option) =>
            option.address
              ? `${option.address}${option.name ? ` (${option.name})` : ''}`
              : option.name || option.uuid,
          noOptionsMessage: () => translate('No free floating IPs'),
          required: true,
        },
      ]}
    />
  );
};
