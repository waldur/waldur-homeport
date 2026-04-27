import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceResourcesTerminate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { DestroyInstanceParams } from '@/openstack/api';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { showSuccess, showErrorResponse } from '@/store/notify';

import { getDeleteField } from './utils';

export const DestroyDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Destroy {name} instance', {
        name: resource.name,
      })}
      {...getDeleteField()}
      submitForm={async (formData: DestroyInstanceParams) => {
        try {
          await marketplaceResourcesTerminate({
            path: { uuid: resource.marketplace_resource_uuid },
            body: { attributes: formData },
          });
          dispatch(
            showSuccess(translate('Instance deletion has been scheduled.')),
          );
          if (refetch) {
            await refetch();
          }
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to delete instance.')),
          );
        }
      }}
    />
  );
};
