import { FC } from 'react';
import { useDispatch } from 'react-redux';
import {
  openstackNetworkRbacPoliciesCreate,
  openstackTenantsList,
} from 'waldur-js-client';

import { parseSelectData } from '@/core/api';
import { ENV } from '@/core/config';
import { returnReactSelectAsyncPaginateObject } from '@/core/utils';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { showSuccess, showErrorResponse } from '@/store/notify';

export const ShareNetworkDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();

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
      submitForm={async (formData) => {
        try {
          await openstackNetworkRbacPoliciesCreate({
            body: {
              network: resource.url,
              policy_type: formData.policy_type,
              target_tenant: formData.target_tenant.url,
            },
          });
          dispatch(showSuccess(translate('Network has been shared.')));
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to share the network.')),
          );
        }
      }}
    />
  );
};
