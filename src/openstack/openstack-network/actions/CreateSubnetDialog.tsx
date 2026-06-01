import arrayMutators from 'final-form-arrays';
import { FC } from 'react';
import { Form } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { openstackNetworksCreateSubnet } from 'waldur-js-client';

import {
  AsyncSelectGroup,
  BooleanGroup,
  FormFooter,
  StringGroup,
  TextGroup,
} from '@/form';
import { NameGroup } from '@/form/NameGroup';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { InternalNetworkAllocationPool } from '@/openstack/openstack-subnet/AllocationPoolsField';
import { networkAutocomplete } from '@/openstack/openstack-subnet/networkAutocomplete';
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
};

export const CreateSubnetDialog: FC<
  Omit<ActionDialogProps, 'resolve'> & { resolve: CreateSubnetDialogResolve }
> = ({ resolve: { resource, refetch, showNetworkField = false } }) => {
  const mutation = useManagedMutation<any, any, CreateSubnetFormData>({
    mutationFn: (formData) => {
      const networkUuid = showNetworkField
        ? formData.network?.uuid
        : resource.uuid;
      const { network: _network, ...submitData } = formData;

      return openstackNetworksCreateSubnet({
        path: { uuid: networkUuid },
        body: submitData,
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
            <InternalNetworkAllocationPool />
          </ModalDialog>
        </form>
      )}
    />
  );
};
