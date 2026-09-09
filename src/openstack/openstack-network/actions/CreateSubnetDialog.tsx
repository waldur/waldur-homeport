import { FORM_ERROR } from 'final-form';
import arrayMutators from 'final-form-arrays';
import { FC, useEffect, useMemo } from 'react';
import { Form, useForm, useFormState } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { openstackNetworksCreateSubnet } from 'waldur-js-client';

import { DirtyStateReporter } from '@/core/DirtyFormContext';
import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { required } from '@/core/validators';
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
  skip_router_connection?: boolean;
};

/** Turn a DRF validation body into react-final-form submit errors.
 *
 * The API answers a bad create with `{"cidr": ["..."], "non_field_errors":
 * [...]}`, and every key but the last is a field of this form, so each message
 * can go under its own control instead of only into a toast. FormGroup already
 * renders `meta.submitError`; nothing but the mapping was missing.
 */
// Module scope, deliberately: react-final-form re-initialises the form whenever
// the `initialValues` identity changes, so an object literal here wipes whatever
// the user has typed on any parent re-render -- and the dialog now has one, since
// reporting dirtiness sets state in ModalRoot.
const INITIAL_VALUES = {
  cidr: '192.168.42.0/24',
  allocation_pools: [{ start: '192.168.42.10', end: '192.168.42.200' }],
};

const toSubmitErrors = (error: unknown) => {
  const body = getErrorBody(error);
  if (!body) return undefined;
  const errors: Record<string, any> = {};
  Object.entries(body).forEach(([field, value]) => {
    const message = Array.isArray(value) ? value.join(' ') : value;
    if (field === 'non_field_errors' || field === 'detail') {
      errors[FORM_ERROR] = message;
    } else {
      errors[field] = message;
    }
  });
  return Object.keys(errors).length ? errors : undefined;
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
  // Both of these make a router impossible: Neutron cannot attach a subnet with
  // no gateway IP, and the second says outright not to attach one. The API
  // rejects either pair, so the field goes away rather than failing on submit.
  const gatewayDisabled =
    Boolean(values.disable_gateway) || Boolean(values.skip_router_connection);
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
      const {
        network: _network,
        router,
        skip_router_connection,
        ...submitData
      } = formData;

      return openstackNetworksCreateSubnet({
        path: { uuid: networkUuid },
        // The API takes the router as a hyperlink, and leaving it out is what
        // asks Waldur to pick one itself; the skip flag defaults to false
        // server-side, so it too is only worth sending when set.
        body: {
          ...submitData,
          ...(router ? { router: router.url } : {}),
          ...(skip_router_connection ? { skip_router_connection: true } : {}),
        },
      });
    },
    successMessage: translate('Subnet has been created.'),
    errorMessage: translate('Unable to create subnet.'),
    refetch,
  });

  return (
    <Form
      initialValues={INITIAL_VALUES}
      mutators={{ ...arrayMutators }}
      onSubmit={async (values) => {
        try {
          await mutation.mutateAsync(values);
        } catch (error) {
          // useManagedMutation raises the toast; returning the body as submit
          // errors is what puts each message under the field it belongs to.
          return toSubmitErrors(error);
        }
      }}
      render={({ handleSubmit, submitError }) => (
        <form onSubmit={handleSubmit}>
          <DirtyStateReporter />
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
            {submitError && (
              <div className="text-danger mb-4">{submitError}</div>
            )}
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
                validate={required}
              />
            )}
            <NameGroup validate={required} />
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
            <BooleanGroup
              name="skip_router_connection"
              label={translate('Do not attach to a router')}
              description={translate(
                'The subnet is created but left unrouted. Attach it later from a router, or connect it from the subnet itself.',
              )}
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
