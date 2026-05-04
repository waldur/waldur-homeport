import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { openstackListenersCreate } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { createLatinNameField } from '@/resource/actions/base';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { useNotify } from '@/store/notify';
import { fetchListStart } from '@/table/actions';

import { PROTOCOL_OPTIONS } from '../constants';
import { poolAutocomplete } from '../poolAutocomplete';

const getPoolUrl = (pool: any): string | null => {
  if (!pool) return null;
  if (typeof pool === 'object' && pool.uuid) {
    return `${ENV.apiEndpoint}api/openstack-pools/${pool.uuid}/`;
  }
  return pool;
};

export const CreateListenerDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();

  const submitForm = useCallback(
    async (formData) => {
      try {
        await openstackListenersCreate({
          body: {
            name: formData.name || undefined,
            load_balancer: resource.url,
            protocol: formData.protocol,
            protocol_port: Number(formData.protocol_port),
            default_pool: getPoolUrl(formData.default_pool),
          },
        });
        showSuccess(translate('Listener has been created.'));
        closeDialog();
        dispatch(
          fetchListStart(
            `loadbalancer-listeners-${resource.uuid}`,
            undefined,
            true,
          ),
        );
        if (refetch) await refetch();
      } catch (e) {
        showErrorResponse(e, translate('Unable to create listener.'));
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
      dialogTitle={translate('Create listener')}
      submitForm={submitForm}
      formFields={[
        { ...createLatinNameField(), required: false },
        {
          name: 'protocol',
          label: translate('Protocol'),
          type: 'select',
          options: PROTOCOL_OPTIONS,
          required: true,
        },
        {
          name: 'protocol_port',
          label: translate('Port'),
          type: 'integer',
          minValue: 1,
          maxValue: 65535,
          required: true,
        },
        {
          name: 'default_pool',
          label: translate('Default pool'),
          type: 'async_select',
          placeholder: translate('Select pool...'),
          loadOptions: poolAutocomplete(resource.uuid),
          defaultOptions: true,
          getOptionValue: (option) => option.uuid,
          getOptionLabel: (option) => option.name,
          noOptionsMessage: () => translate('No pools'),
          isClearable: true,
          required: false,
        },
      ]}
    />
  );
};
