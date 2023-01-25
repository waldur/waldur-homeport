import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import {
  forceDestroyInstance,
  DestroyInstanceParams,
} from '@waldur/openstack/api';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { getDeleteField } from './utils';

export const ForceDestroyDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Force destroy {name} instance', {
        name: resource.name,
      })}
      {...getDeleteField()}
      submitForm={async (formData: DestroyInstanceParams) => {
        try {
          await forceDestroyInstance(
            resource.marketplace_resource_uuid,
            formData,
          );
          dispatch(
            showSuccess(translate('Instance deletion has been scheduled.')),
          );
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to destroy instance.')),
          );
        }
      }}
    />
  );
};
