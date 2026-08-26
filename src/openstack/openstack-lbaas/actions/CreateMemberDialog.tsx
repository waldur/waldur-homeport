import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  OpenStackPool,
  openstackLoadbalancersRetrieve,
  openstackPoolMembersCreate,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { AsyncSelectGroup, FormFooter, NumberGroup, StringGroup } from '@/form';
import { NameGroup } from '@/form/NameGroup';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionDialogProps } from '@/resource/actions/types';

import { subnetAutocomplete } from '../subnetAutocomplete';

const getSubnetUrl = (subnet: any): string => {
  if (typeof subnet === 'object' && subnet?.uuid) {
    return `${ENV.apiEndpoint}api/openstack-subnets/${subnet.uuid}/`;
  }
  return subnet;
};

export const CreateMemberDialog: FC<ActionDialogProps<OpenStackPool>> = ({
  resolve: { resource, refetch },
}) => {
  const { data: loadBalancer, isLoading } = useQuery({
    queryKey: ['lb-for-member-create', resource.load_balancer_uuid],
    queryFn: () =>
      openstackLoadbalancersRetrieve({
        path: { uuid: resource.load_balancer_uuid },
        query: { field: ['tenant_uuid'] },
      }).then((res) => res.data),
    enabled: Boolean(resource.load_balancer_uuid),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  const createMutation = useManagedMutation({
    mutationFn: (formData: any) =>
      openstackPoolMembersCreate({
        body: {
          pool: resource.url,
          name: formData.name || undefined,
          address: formData.address,
          protocol_port: Number(formData.protocol_port),
          weight: formData.weight ? Number(formData.weight) : undefined,
          subnet: getSubnetUrl(formData.subnet),
        },
      }),
    successMessage: translate('Member has been added.'),
    errorMessage: translate('Unable to add member.'),
    invalidateQueries: [
      { queryKey: ['table', `pool-members-${resource.uuid}`] },
    ],
    refetch,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Form
      onSubmit={async (values) => {
        try {
          await createMutation.mutateAsync(values);
        } catch {
          // Handled by useManagedMutation
        }
      }}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Add member')}
            subtitle={
              <ScopeSubtitle
                label={translate('Pool name')}
                name={resource.name}
              />
            }
            footer={<FormFooter />}
          >
            <NameGroup required={false} />
            <StringGroup
              name="address"
              label={translate('IP address')}
              required={true}
              validate={required}
            />
            <NumberGroup
              name="protocol_port"
              label={translate('Port')}
              required={true}
              min={1}
              max={65535}
              validate={required}
            />
            <NumberGroup
              name="weight"
              label={translate('Weight')}
              required={false}
              min={0}
              max={256}
            />
            <AsyncSelectGroup
              name="subnet"
              label={translate('Subnet')}
              required={true}
              placeholder={translate('Select subnet...')}
              loadOptions={subnetAutocomplete(loadBalancer?.tenant_uuid || '')}
              defaultOptions={true}
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) =>
                option.cidr ? `${option.name} (${option.cidr})` : option.name
              }
              noOptionsMessage={() => translate('No subnets')}
              validate={required}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
