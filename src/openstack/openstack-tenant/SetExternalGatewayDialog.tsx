import { useQuery } from '@tanstack/react-query';
import arrayMutators from 'final-form-arrays';
import { Form } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import {
  AvailableExternalNetwork,
  OpenStackRouter,
  openstackRoutersAvailableExternalNetworksList,
  openstackRoutersSetExternalGateway,
  SetExternalGatewayFixedIpRequest,
  SetExternalGatewayRequest,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { BooleanGroup, FormFooter, SelectGroup } from '@/form';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { ExternalGatewayFixedIpsTable } from './ExternalGatewayFixedIpsTable';

interface OwnProps {
  resolve: {
    router: OpenStackRouter;
    refetch?: () => void;
  };
}

interface FixedIpFormValue {
  ip_address?: string;
  subnet_id?: string;
}

interface FormData {
  external_network_id: string;
  disable_snat: boolean;
  external_fixed_ips: FixedIpFormValue[];
}

const networkLabel = (network: AvailableExternalNetwork) => {
  const cidrs = network.subnets
    ?.map((subnet) => subnet.cidr)
    .filter(Boolean)
    .join(', ');
  const sourceLabel =
    network.source === 'rbac'
      ? translate('organization network')
      : translate('global');
  const suffix = cidrs ? ` (${cidrs})` : '';
  return `${network.name}${suffix} — ${sourceLabel}`;
};

export const SetExternalGatewayDialog = ({ resolve }: OwnProps) => {
  const { router, refetch } = resolve;

  const query = useQuery({
    queryKey: ['RouterAvailableExternalNetworks', router.uuid],
    queryFn: async () =>
      (
        await openstackRoutersAvailableExternalNetworksList({
          path: { uuid: router.uuid },
        })
      ).data,
  });

  const mutation = useManagedMutation<any, any, FormData>({
    mutationFn: (formData) => {
      const networks = query.data || [];
      const selected = networks.find(
        (n) => n.backend_id === formData.external_network_id,
      );
      const isRbac = selected?.source === 'rbac';

      const body: SetExternalGatewayRequest = {
        external_network_id: formData.external_network_id,
      };

      // Advanced controls (SNAT, fixed IPs) are only offered for
      // organization-owned (RBAC-shared) networks to avoid leaking a global
      // external network.
      if (isRbac) {
        body.enable_snat = formData.disable_snat ? false : null;
        const fixedIps = (formData.external_fixed_ips || [])
          .filter((ip) => ip.ip_address)
          .map(
            (ip): SetExternalGatewayFixedIpRequest => ({
              ip_address: ip.ip_address,
              ...(ip.subnet_id ? { subnet_id: ip.subnet_id } : {}),
            }),
          );
        if (fixedIps.length) {
          body.external_fixed_ips = fixedIps;
        }
      }

      return openstackRoutersSetExternalGateway({
        path: { uuid: router.uuid },
        body,
      });
    },
    successMessage: translate('External gateway update was scheduled.'),
    errorMessage: translate('Unable to update the external gateway.'),
    invalidateQueries: [{ queryKey: ['openstack-routers'] }],
  });

  const initialValues: FormData = {
    external_network_id: router.external_network_id || '',
    disable_snat: router.enable_snat === false,
    external_fixed_ips: Array.isArray(router.external_fixed_ips)
      ? (router.external_fixed_ips as FixedIpFormValue[])
      : [],
  };

  return (
    <Form<FormData>
      onSubmit={async (values) => {
        await mutation.mutateAsync(values);
        refetch?.();
      }}
      initialValues={initialValues}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit, values }) => {
        const networks = query.data || [];
        const selected = networks.find(
          (n) => n.backend_id === values.external_network_id,
        );
        const isRbac = selected?.source === 'rbac';
        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={translate('Set external gateway')}
              footer={<FormFooter submitLabel={translate('Set gateway')} />}
            >
              <SelectGroup
                name="external_network_id"
                label={translate('External network')}
                description={translate(
                  'The external network to use as the gateway for this router.',
                )}
                required
                options={networks}
                getOptionValue={(n: AvailableExternalNetwork) => n.backend_id}
                getOptionLabel={networkLabel}
                simpleValue
                isLoading={query.isLoading}
                placeholder={translate('Select external network…')}
                noOptionsMessage={() =>
                  translate('No external networks are available.')
                }
                validate={required}
              />

              {isRbac && (
                <>
                  <BooleanGroup
                    name="disable_snat"
                    type="checkbox"
                    label={translate('Disable source NAT (SNAT)')}
                    description={translate(
                      'Disable SNAT to use this gateway for direct routing between networks.',
                    )}
                  />

                  <FormGroup
                    label={translate('Fixed IPs')}
                    description={translate(
                      'Optionally pin specific IP addresses on the gateway port.',
                    )}
                    spaceless
                  >
                    <FieldArray name="external_fixed_ips">
                      {({ fields }) => (
                        <ExternalGatewayFixedIpsTable
                          fields={fields}
                          subnets={selected?.subnets}
                        />
                      )}
                    </FieldArray>
                  </FormGroup>
                </>
              )}
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
