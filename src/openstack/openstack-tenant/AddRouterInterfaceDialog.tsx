import { useQuery } from '@tanstack/react-query';
import { Form } from 'react-final-form';
import {
  openstackRoutersAddRouterInterface,
  openstackPortsList,
  openstackSubnetsList,
} from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { RadioGroup, SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { ActionDialogFinal } from '@/modal/ActionDialogFinal';
import { useManagedMutation } from '@/modal/useManagedMutation';
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

  const { data, isLoading, error, refetch } = useQuery({
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
    <Form
      onSubmit={async (values) => {
        try {
          await mutation.mutateAsync(values as any);
        } catch {
          // Handled by useManagedMutation
        }
      }}
      initialValues={{ type: typeChoices[0].value, resource: '' }}
      render={({ handleSubmit, submitting, invalid, values }) => (
        <ActionDialogFinal
          title={translate('Add router interface')}
          onSubmit={handleSubmit}
          submitting={submitting}
          invalid={invalid}
          loading={isLoading}
        >
          {error ? (
            <LoadingErred loadData={refetch} />
          ) : data ? (
            <>
              <RadioGroup
                name="type"
                label={translate('Type')}
                required
                choices={typeChoices}
                direction="horizontal"
              />
              <SelectGroup
                name="resource"
                label={
                  values.type === 'subnet'
                    ? translate('Select subnet')
                    : translate('Select existing port')
                }
                required
                simpleValue
                options={
                  values.type === 'subnet'
                    ? data.subnets.map((subnet) => ({
                        value: subnet.url,
                        label: `${subnet.name} (${subnet.cidr})`,
                      }))
                    : data.ports.map((port) => {
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
                      })
                }
              />
            </>
          ) : null}
        </ActionDialogFinal>
      )}
    />
  );
};
