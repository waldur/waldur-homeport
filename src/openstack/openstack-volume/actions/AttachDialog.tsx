import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import {
  openstackInstancesList,
  openstackVolumesAttach,
} from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { showErrorResponse, showSuccess } from '@/store/notify';

export const AttachDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();

  const asyncState = useQuery({
    queryKey: ['attachableInstances', resource.uuid],
    queryFn: async () => {
      const instances = await getAllPages((page) =>
        openstackInstancesList({
          query: {
            page,
            attach_volume_uuid: resource.uuid,
            field: ['url', 'name'],
          },
        }),
      );
      return {
        instances: instances.map((choice) => ({
          value: choice.url,
          label: choice.name,
        })),
      };
    },
    staleTime: UI_STALE_TIME,
  });

  const fields = asyncState.data
    ? [
        {
          name: 'instance',
          label: translate('Instance'),
          type: 'select',
          required: true,
          options: asyncState.data.instances,
        },
      ]
    : [];

  return (
    <ResourceActionDialog
      dialogTitle={translate('Attach OpenStack Volume to Instance')}
      formFields={fields}
      submitForm={async (formData) => {
        try {
          await openstackVolumesAttach({
            path: { uuid: resource.uuid },
            body: { instance: formData.instance },
          });

          dispatch(
            showSuccess(translate('Volume has been attached to instance.')),
          );
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(
            showErrorResponse(
              e,
              translate('Unable to attach volume to instance.'),
            ),
          );
        }
      }}
    />
  );
};
