import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { vmwareDisksExtend } from 'waldur-js-client';

import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { showSuccess, showErrorResponse } from '@/store/notify';

export const ExtendDiskDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Extend disk')}
      formFields={[
        {
          label: translate('Size'),
          type: 'integer',
        },
      ]}
      initialValues={{ size: resource.size }}
      submitForm={async (formData) => {
        try {
          await vmwareDisksExtend({
            path: { uuid: resource.uuid },
            body: { size: formData.size },
          });
          dispatch(
            showSuccess(translate('Disk extension has been scheduled.')),
          );
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(showErrorResponse(e, translate('Unable to extend disk.')));
        }
      }}
    />
  );
};
