import { useQuery } from '@tanstack/react-query';
import arrayMutators from 'final-form-arrays';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import {
  openstackFloatingIpsList,
  OpenStackInstance,
  openstackInstancesUpdateFloatingIps,
} from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { AsyncActionDialog } from '@/resource/actions/AsyncActionDialog';

import { FloatingIpsList } from './FloatingIpsList';

interface FloatingIpPair {
  floating_ip: string | boolean;
  subnet: string;
  address: string;
  subnet_name: string;
}

interface FloatingIPsFormData {
  floating_ips: FloatingIpPair[];
}

interface UpdateFloatingIpsDialogProps {
  resolve: {
    resource: OpenStackInstance;
    refetch?(): void;
  };
}

export const UpdateFloatingIpsDialog: FC<UpdateFloatingIpsDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const {
    data: floatingIps,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['floatingIps', resource.tenant_uuid],
    queryFn: () =>
      getAllPages((page) =>
        openstackFloatingIpsList({
          query: {
            page,
            tenant_uuid: resource.tenant_uuid,
            free: true,
            field: ['url', 'address'],
          },
        }),
      ).then((data) => [
        {
          value: true,
          label: translate('Auto-assign floating IP'),
        },
        ...data.map((item) => ({
          label: item.address,
          value: item.url,
        })),
      ]),
  });

  const { mutateAsync } = useManagedMutation<any, any, FloatingIPsFormData>({
    mutationFn: (formData) =>
      openstackInstancesUpdateFloatingIps({
        path: { uuid: resource.uuid },
        body: {
          floating_ips: (formData.floating_ips ?? [])
            .filter((item) => item.subnet)
            .map((item) => {
              if (item.floating_ip === true) {
                return {
                  subnet: item.subnet,
                };
              } else {
                return {
                  subnet: item.subnet,
                  url: item.floating_ip as string,
                };
              }
            }),
        },
      }),
    successMessage: translate('Floating IPs update has been scheduled.'),
    errorMessage: translate('Unable to update floating IPs.'),
    refetch,
  });

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

  const subnets = useMemo(
    () => [
      { value: '', label: translate('Select connected subnet') },
      ...resource.ports.map((port) => ({
        value: port.subnet,
        label: `${port.subnet_name} (${port.subnet_cidr})`,
      })),
    ],
    [resource.ports],
  );

  return (
    <Form<FloatingIPsFormData>
      onSubmit={mutateAsync}
      initialValues={initialValues}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <AsyncActionDialog
            title={translate('Update floating IPs in {name} virtual machine', {
              name: resource.name,
            })}
            loading={isLoading}
            error={error}
          >
            {floatingIps ? (
              <FieldArray name="floating_ips">
                {({ fields }) => (
                  <FloatingIpsList
                    fields={fields}
                    floatingIps={floatingIps}
                    subnets={subnets}
                  />
                )}
              </FieldArray>
            ) : null}
          </AsyncActionDialog>
        </form>
      )}
    />
  );
};
