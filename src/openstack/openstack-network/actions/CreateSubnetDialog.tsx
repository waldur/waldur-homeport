import arrayMutators from 'final-form-arrays';
import { FC, useEffect, useMemo } from 'react';
import { Form, useForm, useFormState } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { openstackNetworksCreateSubnet } from 'waldur-js-client';

import {
  AsyncSelectGroup,
  BooleanGroup,
  FormFooter,
  StringGroup,
  TextGroup,
} from '@/form';
import { FormGroup } from '@/form';
import { NameGroup } from '@/form/NameGroup';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { InternalNetworkAllocationPool } from '@/openstack/openstack-subnet/AllocationPoolsField';
import { networkAutocomplete } from '@/openstack/openstack-subnet/networkAutocomplete';
import { routerAutocomplete } from '@/openstack/openstack-subnet/routerAutocomplete';
import { IpAddressList } from '@/openstack/openstack-tenant/IpAddressList';
import { StaticRoutesTable } from '@/openstack/openstack-tenant/StaticRoutesTable';
import { ActionDialogProps } from '@/resource/actions/types';

type CreateSubnetDialogResolve = {
  resource: any;
  refetch?: () => void;
  showNetworkField?: boolean;
};

type CreateSubnetFormData = {
  network?: { uuid: string };
  name: string;
  description?: string;
  cidr?: string;
  allocation_pools?: Array<{ start: string; end: string }>;
  gateway_ip?: string;
  disable_gateway?: boolean;
  host_routes?: any[];
  dns_nameservers?: any[];
  router?: { url: string };
};

/** The routers on offer are those of the tenant that owns the *network*, which
 * is what the API validates the choice against -- and with the network field
 * shown that is not necessarily the tenant whose page we are on: the network
 * list includes networks shared in over RBAC, which belong to someone else.
 * The field also disappears while `disable_gateway` is set, because Neutron
 * cannot put a router interface on a subnet with no gateway IP and the API
 * rejects the pair. */
const RouterField: FC<{
  showNetworkField: boolean;
  networkTenantUuid?: string;
}> = ({ showNetworkField, networkTenantUuid }) => {
  const form = useForm();
  const { values } = useFormState<CreateSubnetFormData>({
    subscription: { values: true },
  });
  const tenantUuid = showNetworkField
    ? (values.network as any)?.tenant_uuid
    : networkTenantUuid;
  const gatewayDisabled = Boolean(values.disable_gateway);
  const loadOptions = useMemo(
    () => (tenantUuid ? routerAutocomplete(tenantUuid) : undefined),
    [tenantUuid],
  );

  // A router picked for one tenant is meaningless for another, and one picked
  // before the gateway was disabled would be rejected on submit.
  useEffect(() => {
    if (values.router) {
      form.change('router', undefined);
    }
  }, [tenantUuid, gatewayDisabled]);

  if (!tenantUuid || gatewayDisabled || !loadOptions) {
    return null;
  }
  return (
    <AsyncSelectGroup
      name="router"
      label={translate('Router')}
      placeholder={translate('Select router...')}
      description={translate(
        'Router to attach the subnet to. Leave empty to let Waldur pick one.',
      )}
      loadOptions={loadOptions}
      defaultOptions={true}
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) => option.name}
      noOptionsMessage={() => translate('No routers')}
      isClearable={true}
    />
  );
};

export const CreateSubnetDialog: FC<
  Omit<ActionDialogProps, 'resolve'> & { resolve: CreateSubnetDialogResolve }
> = ({ resolve: { resource, refetch, showNetworkField = false } }) => {
  const mutation = useManagedMutation<any, any, CreateSubnetFormData>({
    mutationFn: (formData) => {
      const networkUuid = showNetworkField
        ? formData.network?.uuid
        : resource.uuid;
      const { network: _network, router, ...submitData } = formData;

      return openstackNetworksCreateSubnet({
        path: { uuid: networkUuid },
        // The API takes the router as a hyperlink, and leaving it out is what
        // asks Waldur to pick one itself.
        body: { ...submitData, ...(router ? { router: router.url } : {}) },
      });
    },
    successMessage: translate('Subnet has been created.'),
    errorMessage: translate('Unable to create subnet.'),
    refetch,
  });

  const initialCidr = '192.168.42.0/24';
  const defaultPool = {
    start: '192.168.42.10',
    end: '192.168.42.200',
  };

  return (
    <Form
      initialValues={{
        cidr: initialCidr,
        allocation_pools: [defaultPool],
      }}
      mutators={{ ...arrayMutators }}
      onSubmit={async (values) => {
        try {
          await mutation.mutateAsync(values);
        } catch {
          // Handled by useManagedMutation
        }
      }}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Create subnet')}
            subtitle={
              <ScopeSubtitle
                label={translate('Network name')}
                name={resource.name}
              />
            }
            footer={<FormFooter />}
          >
            {showNetworkField && (
              <AsyncSelectGroup
                name="network"
                label={translate('Network')}
                placeholder={translate('Select network...')}
                loadOptions={networkAutocomplete(resource.uuid)}
                defaultOptions={true}
                getOptionValue={(option) => option.uuid}
                getOptionLabel={(option) => option.name}
                noOptionsMessage={() => translate('No networks')}
                isClearable={true}
                required={true}
              />
            )}
            <NameGroup />
            <TextGroup
              name="description"
              label={translate('Description')}
              maxLength={4096}
            />
            <StringGroup
              name="gateway_ip"
              label={translate('Gateway IP of this subnet')}
            />
            <BooleanGroup
              name="disable_gateway"
              label={translate('Disable gateway IP advertising via DHCP')}
            />
            <FormGroup label={translate('Host routes')}>
              <FieldArray name="host_routes" component={StaticRoutesTable} />
            </FormGroup>
            <FormGroup label={translate('DNS name servers')}>
              <FieldArray name="dns_nameservers" component={IpAddressList} />
            </FormGroup>
            <StringGroup
              name="cidr"
              label={translate('Internal network mask (CIDR)')}
            />
            <RouterField
              showNetworkField={showNetworkField}
              networkTenantUuid={resource.tenant_uuid}
            />
            <InternalNetworkAllocationPool />
          </ModalDialog>
        </form>
      )}
    />
  );
};
