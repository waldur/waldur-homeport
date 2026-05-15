import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import {
  OpenStackPool,
  openstackLoadbalancersRetrieve,
  openstackPoolMembersCreate,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { createLatinNameField } from '@/resource/actions/base';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { fetchListStart } from '@/table/actions';

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
  const dispatch = useDispatch();

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
    onSuccess: () => {
      dispatch(
        fetchListStart(`pool-members-${resource.uuid}`, undefined, true),
      );
    },
    refetch,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <ResourceActionDialog
      dialogTitle={translate('Add member')}
      submitForm={async (values) => {
        try {
          await createMutation.mutateAsync(values);
        } catch {
          // Handled by useManagedMutation
        }
      }}
      formFields={[
        { ...createLatinNameField(), required: false },
        {
          name: 'address',
          label: translate('IP address'),
          type: 'string',
          required: true,
        },
        {
          name: 'protocol_port',
          label: translate('Port'),
          type: 'integer',
          minValue: 1,
          maxValue: 65535,
          required: true,
        },
        {
          name: 'weight',
          label: translate('Weight'),
          type: 'integer',
          minValue: 0,
          maxValue: 256,
          required: false,
        },
        {
          name: 'subnet',
          label: translate('Subnet'),
          type: 'async_select',
          placeholder: translate('Select subnet...'),
          loadOptions: subnetAutocomplete(loadBalancer?.tenant_uuid || ''),
          defaultOptions: true,
          getOptionValue: (option) => option.uuid,
          getOptionLabel: (option) =>
            option.cidr ? `${option.name} (${option.cidr})` : option.name,
          noOptionsMessage: () => translate('No subnets'),
          required: true,
        },
      ]}
    />
  );
};
