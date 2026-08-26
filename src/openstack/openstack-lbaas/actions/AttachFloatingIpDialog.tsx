import { FC } from 'react';
import {
  OpenStackLoadBalancer,
  openstackLoadbalancersAttachFloatingIp,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

import { floatingIpAutocomplete } from '../floatingIpAutocomplete';

export const AttachFloatingIpDialog: FC<
  ActionDialogProps<OpenStackLoadBalancer>
> = ({ resolve: { resource, refetch } }) => {
  const attachMutation = useManagedMutation({
    mutationFn: (formData: any) => {
      const floatingIp = formData.floating_ip;
      const floatingIpUrl =
        typeof floatingIp === 'object' ? floatingIp.url : floatingIp;
      return openstackLoadbalancersAttachFloatingIp({
        path: { uuid: resource.uuid },
        body: { floating_ip: floatingIpUrl },
      });
    },
    successMessage: translate('Floating IP is being attached.'),
    errorMessage: translate('Unable to attach floating IP.'),
    refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Attach floating IP')}
      dialogSubtitle={
        <ScopeSubtitle
          label={translate('Load balancer name')}
          name={resource.name}
        />
      }
      submitForm={async (values) => {
        try {
          await attachMutation.mutateAsync(values);
        } catch {
          // Handled by useManagedMutation
        }
      }}
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
