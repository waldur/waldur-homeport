import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { restoreSnapshot } from '@waldur/openstack/api';
import {
  createLatinNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const RestoreSnapshotDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Restore volume snapshot')}
      formFields={[createLatinNameField(), createDescriptionField()]}
      initialValues={{
        mtu: resource.mtu,
      }}
      submitForm={async (formData) => {
        try {
          await restoreSnapshot(resource.uuid, formData);
          dispatch(
            showSuccess(translate('Volume snapshot has been restored.')),
          );
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(
            showErrorResponse(
              e,
              translate('Unable to restore volume snapshot.'),
            ),
          );
        }
      }}
    />
  );
};
