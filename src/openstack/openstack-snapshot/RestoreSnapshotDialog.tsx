import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { openstackSnapshotsRestore } from 'waldur-js-client';

import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import {
  createLatinNameField,
  createDescriptionField,
} from '@/resource/actions/base';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { showSuccess, showErrorResponse } from '@/store/notify';

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
          await openstackSnapshotsRestore({
            path: { uuid: resource.uuid },
            body: formData,
          });
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
