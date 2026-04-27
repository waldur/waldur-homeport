import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { openstackVolumesSnapshot } from 'waldur-js-client';

import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import {
  createLatinNameField,
  createDescriptionField,
} from '@/resource/actions/base';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { showSuccess, showErrorResponse } from '@/store/notify';

export const CreateSnapshotDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Create snapshot for OpenStack volume')}
      formFields={[
        createLatinNameField(),
        createDescriptionField(),
        {
          name: 'kept_until',
          type: 'datetime',
          required: false,
          label: translate('Kept until'),
          help_text: translate(
            'Guaranteed time of snapshot retention. If null - keep forever.',
          ),
        },
      ]}
      initialValues={{
        name: resource.name + '-snapshot',
      }}
      submitForm={async (formData) => {
        try {
          await openstackVolumesSnapshot({
            path: { uuid: resource.uuid },
            body: formData,
          });
          dispatch(showSuccess(translate('Volume snapshot has been created.')));
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(
            showErrorResponse(
              e,
              translate('Unable to create volume snapshot.'),
            ),
          );
        }
      }}
    />
  );
};
