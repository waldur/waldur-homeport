import { useQuery } from '@tanstack/react-query';
import {
  openstackRoutersAddRouterInterface,
  openstackPortsList,
  openstackSubnetsList,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { renderFieldOrDash } from '@/table/utils';

const typeChoices = [
  { value: 'subnet', label: translate('Subnet') },
  { value: 'port', label: translate('Port') },
];

export const AddRouterInterfaceDialog = ({ resolve: { router } }) => {
  const mutation = useManagedMutation<
    any,
    any,
    { type: 'subnet' | 'port'; resource: string }
  >({
    mutationFn: (formData) => {
      const body =
        formData.type === 'subnet'
          ? { subnet: formData.resource }
          : { port: formData.resource };

      return openstackRoutersAddRouterInterface({
        path: { uuid: router.uuid },
        body,
      });
    },
    successMessage: translate('Router interface was added.'),
    errorMessage: translate('Unable to add router interface.'),
  });

  const query = useQuery({
    queryKey: ['AddRouterInterface', router.tenant_uuid],

    queryFn: async () => {
      const subnets = (
        await openstackSubnetsList({
          query: { tenant_uuid: router.tenant_uuid },
        })
      ).data;
      const ports = (
        await openstackPortsList({
          query: {
            tenant_uuid: router.tenant_uuid,
            has_device_owner: false,
            exclude_subnet_uuids: (router?.ports || [])
              .map((port) => port.subnet_uuid)
              .join(','),
          },
        })
      ).data;
      return { subnets, ports };
    },
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Add router interface')}
      formFields={(values) =>
        query.data
          ? [
              {
                name: 'type',
                label: translate('Type'),
                type: 'radio',
                required: true,
                choices: typeChoices,
                direction: 'horizontal',
              },
              {
                name: 'resource',
                label:
                  values.type === 'subnet'
                    ? translate('Select subnet')
                    : translate('Select existing port'),
                type: 'select',
                required: true,
                options:
                  values.type === 'subnet'
                    ? query.data.subnets.map((subnet) => ({
                        value: subnet.url,
                        label: `${subnet.name} (${subnet.cidr})`,
                      }))
                    : query.data.ports.map((port) => {
                        const ips = port.fixed_ips?.length
                          ? port.fixed_ips
                              .map((fip) => fip.ip_address)
                              .join(', ')
                          : '—';
                        const mac = renderFieldOrDash(port.mac_address);
                        const nameOrUuid = port.name || port.uuid;
                        return {
                          value: port.url,
                          label: `${ips} (${mac}) / ${nameOrUuid}`.trim(),
                        };
                      }),
              },
            ]
          : []
      }
      loading={query.isLoading}
      error={query.error}
      initialValues={{ type: typeChoices[0].value, resource: '' }}
      submitForm={async (values) => {
        try {
          await mutation.mutateAsync(values);
        } catch {
          // Handled by useManagedMutation
        }
      }}
    />
  );
};
