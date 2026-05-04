import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { OpenStackPool, openstackHealthMonitorsCreate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { createLatinNameField } from '@/resource/actions/base';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { useNotify } from '@/store/notify';
import { fetchListStart } from '@/table/actions';

import { PROTOCOL_OPTIONS } from '../constants';

export const CreateHealthMonitorDialog: FC<
  ActionDialogProps<OpenStackPool>
> = ({ resolve: { resource, refetch } }) => {
  const dispatch = useDispatch();
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();

  const submitForm = useCallback(
    async (formData) => {
      try {
        await openstackHealthMonitorsCreate({
          body: {
            pool: resource.url,
            name: formData.name || undefined,
            type: formData.type,
            delay: formData.delay ? Number(formData.delay) : undefined,
            timeout: formData.timeout ? Number(formData.timeout) : undefined,
            max_retries: formData.max_retries
              ? Number(formData.max_retries)
              : undefined,
          },
        });
        showSuccess(translate('Health monitor has been created.'));
        closeDialog();
        dispatch(
          fetchListStart(
            `pool-healthmonitors-${resource.uuid}`,
            undefined,
            true,
          ),
        );
        if (refetch) await refetch();
      } catch (e) {
        showErrorResponse(e, translate('Unable to create health monitor.'));
      }
    },
    [closeDialog, dispatch, refetch, resource, showErrorResponse, showSuccess],
  );

  return (
    <ResourceActionDialog
      dialogTitle={translate('Add health monitor')}
      submitForm={submitForm}
      formFields={[
        { ...createLatinNameField(), required: false },
        {
          name: 'type',
          label: translate('Type'),
          type: 'select',
          options: PROTOCOL_OPTIONS,
          required: true,
        },
        {
          name: 'delay',
          label: translate('Delay (seconds)'),
          type: 'integer',
          minValue: 1,
          required: false,
        },
        {
          name: 'timeout',
          label: translate('Timeout (seconds)'),
          type: 'integer',
          minValue: 1,
          required: false,
        },
        {
          name: 'max_retries',
          label: translate('Max retries'),
          type: 'integer',
          minValue: 1,
          maxValue: 10,
          required: false,
        },
      ]}
    />
  );
};
