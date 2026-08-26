import { FC, useMemo } from 'react';
import {
  openstackNetworkRbacPoliciesCreate,
  openstackTenantsList,
  PolicyTypeEnum,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select';
import { translate } from '@/i18n';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

export const ShareNetworkDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const mutation = useManagedMutation<
    any,
    any,
    {
      policy_type: string;
      target_tenant: { url: string };
    }
  >({
    mutationFn: (formData) =>
      openstackNetworkRbacPoliciesCreate({
        body: {
          network: resource.url,
          policy_type: formData.policy_type as PolicyTypeEnum,
          target_tenant: formData.target_tenant.url,
        },
      }),

    successMessage: translate('Network has been shared.'),
    errorMessage: translate('Unable to share the network.'),
    refetch: refetch,
  });

  const tenantLoader = useMemo(
    () =>
      createLoadOptions(openstackTenantsList, 'name', {
        service_settings_uuid: resource.service_settings_uuid,
        field: ['uuid', 'name', 'url'],
      }),
    [resource.service_settings_uuid],
  );

  return (
    <ResourceActionDialog
      dialogTitle={translate('Share network')}
      dialogSubtitle={
        <ScopeSubtitle label={translate('Network name')} name={resource.name} />
      }
      dialogFullButtons
      dialogSubmitLabel={translate('Share')}
      formFields={[
        {
          name: 'target_tenant',
          label: translate('Tenant'),
          type: 'async_select',
          loadOptions: tenantLoader,
          getOptionLabel: (option) => option.name,
          getOptionValue: (option) => option.url,
        },
        {
          name: 'policy_type',
          label: translate('Policy type'),
          type: 'radio',
          direction: 'horizontal',
          justify: 'start',
          choices: [
            { value: 'access_as_shared', label: translate('Shared') },
            { value: 'access_as_external', label: translate('External') },
          ],
          hideLabel: true,
          spaceless: true,
        },
      ]}
      submitForm={mutation.mutateAsync}
    />
  );
};
