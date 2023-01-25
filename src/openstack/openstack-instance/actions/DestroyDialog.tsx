import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { destroyInstance, DestroyInstanceParams } from '@waldur/openstack/api';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

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
          await destroyInstance(resource.marketplace_resource_uuid, formData);
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
