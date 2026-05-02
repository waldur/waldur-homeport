import { FC } from 'react';
import {
  openstackNetworkRbacPoliciesCreate,
  openstackTenantsList,
  PolicyTypeEnum,
} from 'waldur-js-client';

import { parseSelectData } from '@/core/api';
import { ENV } from '@/core/config';
import { returnReactSelectAsyncPaginateObject } from '@/core/utils';
import { translate } from '@/i18n';
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

  return (
    <ResourceActionDialog
      dialogTitle={translate('Share {name} network', { name: resource.name })}
      dialogFullButtons
      dialogSubmitLabel={translate('Share')}
      formFields={[
        {
          name: 'target_tenant',
          label: translate('Tenant'),
          type: 'async_select',
          loadOptions: async (query: string, prevOptions, { page }) => {
            const response = await openstackTenantsList({
              query: {
                name: query,
                service_settings_uuid: resource.service_settings_uuid,
                field: ['uuid', 'name', 'url'],
                page: page,
                page_size: ENV.pageSize,
              },
            });
            return returnReactSelectAsyncPaginateObject(
              parseSelectData(response),
              prevOptions,
              page,
            );
          },
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
