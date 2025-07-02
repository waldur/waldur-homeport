import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { openstackTenantsList } from 'waldur-js-client';

import { parseSelectData } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ShareOpenstackNetwork } from '@waldur/openstack/api';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

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
          align: 'left',
          choices: [
            { value: 'access_as_shared', label: translate('Shared') },
            { value: 'access_as_external', label: translate('External') },
          ],

          spaceless: true,
        },
      ]}
      submitForm={async (formData) => {
        try {
          await ShareOpenstackNetwork({
            path: { uuid: resource.uuid },
            body: {
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
