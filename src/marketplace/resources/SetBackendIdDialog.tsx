import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceProviderResourcesSetBackendId } from 'waldur-js-client';

import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { showSuccess, showErrorResponse } from '@/store/notify';

export const SetBackendIdDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Set backend ID')}
      formFields={[
        {
          name: 'backend_id',
          label: translate('Backend ID'),
          required: true,
          type: 'string',
        },
      ]}
      initialValues={{
        backend_id: resource.backend_id,
      }}
      submitForm={async (formData) => {
        try {
          await marketplaceProviderResourcesSetBackendId({
            path: { uuid: resource.uuid },
            body: formData,
          });
          dispatch(
            showSuccess(translate('Backend ID has been successfully set.')),
          );
          if (refetch) {
            await refetch();
          }
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to set backend ID.')),
          );
        }
      }}
    />
  );
};
