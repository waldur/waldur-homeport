import { FC } from 'react';
import { Form } from 'react-final-form';
import { openstackLoadbalancersCreate } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { required } from '@/core/validators';
import { AsyncSelectGroup, FormFooter } from '@/form';
import { NameGroup } from '@/form/NameGroup';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { OpenStackTenant } from '@/openstack/openstack-tenant/types';
import { ActionDialogProps } from '@/resource/actions/types';

import { subnetAutocomplete } from '../subnetAutocomplete';

export const CreateLoadBalancerDialog: FC<
  ActionDialogProps<OpenStackTenant>
> = ({ resolve: { resource, refetch } }) => {
  const createMutation = useManagedMutation({
    mutationFn: (formData: any) => {
      const subnet = formData.vip_subnet;
      const subnetUuid = typeof subnet === 'object' ? subnet?.uuid : subnet;
      const vipSubnetUrl = `${ENV.apiEndpoint}api/openstack-subnets/${subnetUuid}/`;
      return openstackLoadbalancersCreate({
        body: {
          name: formData.name,
          tenant: resource.url,
          vip_subnet: vipSubnetUrl,
        },
      });
    },
    successMessage: translate('OpenStack load balancer has been created.'),
    errorMessage: translate('Unable to create OpenStack load balancer.'),
    refetch,
  });

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
            title={translate('Create load balancer')}
            subtitle={
              <ScopeSubtitle
                label={translate('Tenant name')}
                name={resource.name}
              />
            }
            footer={<FormFooter />}
          >
            <NameGroup />
            <AsyncSelectGroup
              name="vip_subnet"
              label={translate('VIP subnet')}
              placeholder={translate('Select subnet...')}
              loadOptions={subnetAutocomplete(resource.uuid)}
              defaultOptions={true}
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) =>
                option.network_name
                  ? `${option.name} (${option.cidr}) - ${option.network_name}`
                  : `${option.name} (${option.cidr})`
              }
              noOptionsMessage={() => translate('No subnets')}
              isClearable={false}
              required={true}
              validate={required}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
