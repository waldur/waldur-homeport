import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { openstackNetworksSetMtu } from 'waldur-js-client';

import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { showSuccess, showErrorResponse } from '@/store/notify';

export const SetMtuDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Set MTU')}
      formFields={[
        {
          name: 'mtu',
          type: 'integer',
          label: translate('MTU'),
          minValue: 68,
          maxValue: 65536,
        },
      ]}
      initialValues={{
        mtu: resource.mtu,
      }}
      submitForm={async (formData) => {
        try {
          await openstackNetworksSetMtu({
            path: { uuid: resource.uuid },
            body: { mtu: formData.mtu },
          });
          dispatch(showSuccess(translate('Network MTU has been updated.')));
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to update network MTU.')),
          );
        }
      }}
    />
  );
};
