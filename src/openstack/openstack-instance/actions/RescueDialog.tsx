import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  InstanceRescueRequest,
  openstackImagesList,
  openstackInstancesRescue,
} from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { translate } from '@/i18n';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

export const RescueDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const mutation = useManagedMutation<any, any, InstanceRescueRequest>({
    mutationFn: (formData) =>
      openstackInstancesRescue({
        path: { uuid: resource.uuid },
        body: formData,
      }),

    successMessage: translate('Rescue has been scheduled.'),
    errorMessage: translate('Unable to rescue the instance.'),
    refetch: refetch,
  });

  const asyncState = useQuery({
    queryKey: ['rescue-images', resource.tenant_uuid],
    queryFn: async () => {
      const images = await getAllPages((page) =>
        openstackImagesList({
          query: {
            page,
            tenant_uuid: resource.tenant_uuid,
            is_rescue_image: true,
          },
        }),
      );
      return {
        images: images.map((image) => ({
          label: image.name,
          value: image.url,
        })),
      };
    },
    staleTime: UI_STALE_TIME,
  });

  const fields = asyncState.data
    ? [
        {
          name: 'rescue_image',
          type: 'select',
          label: translate('Rescue image'),
          help_text: translate(
            'Optional rescue image. Required for volume-backed instances; only stable-device rescue images (Glance hw_rescue_device or hw_rescue_bus) are listed.',
          ),
          options: asyncState.data.images,
        },
      ]
    : [];

  return (
    <ResourceActionDialog
      dialogTitle={translate('Rescue instance')}
      dialogSubtitle={
        <ScopeSubtitle
          label={translate('Instance name')}
          name={resource.name}
        />
      }
      dialogSubmitLabel={translate('Rescue')}
      loading={asyncState.isLoading}
      error={asyncState.error}
      formFields={fields}
      submitForm={mutation.mutateAsync}
    />
  );
};
