import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { openstackPoolsCreate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { createLatinNameField } from '@/resource/actions/base';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { useNotify } from '@/store/notify';
import { fetchListStart } from '@/table/actions';

import { PROTOCOL_OPTIONS } from '../constants';

export const CreatePoolDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();

  const submitForm = useCallback(
    async (formData) => {
      try {
        await openstackPoolsCreate({
          body: {
            name: formData.name,
            load_balancer: resource.url,
            protocol: formData.protocol,
          },
        });
        showSuccess(translate('Pool has been created.'));
        closeDialog();
        dispatch(
          fetchListStart(
            `loadbalancer-pools-${resource.uuid}`,
            undefined,
            true,
          ),
        );
        if (refetch) await refetch();
      } catch (e) {
        showErrorResponse(e, translate('Unable to create pool.'));
      }
    },
    [
      closeDialog,
      dispatch,
      refetch,
      resource.url,
      showErrorResponse,
      showSuccess,
    ],
  );

  return (
    <ResourceActionDialog
      dialogTitle={translate('Create pool')}
      submitForm={submitForm}
      formFields={[
        createLatinNameField(),
        {
          name: 'protocol',
          label: translate('Protocol'),
          type: 'select',
          options: PROTOCOL_OPTIONS,
          required: true,
        },
      ]}
    />
  );
};
