import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Form } from 'react-final-form';
import { openstackVolumesRetype } from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { required } from '@/core/validators';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { loadVolumeTypes } from '@/openstack/api';
import { AsyncActionDialog } from '@/resource/actions/AsyncActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

export const RetypeDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const asyncState = useQuery({
    queryKey: ['volumeTypes', resource.tenant_uuid, resource.type],
    queryFn: async () => {
      const types = await loadVolumeTypes({
        tenant_uuid: resource.tenant_uuid,
      });
      return {
        types: types
          .map((volumeType) => ({
            value: volumeType.url,
            label: volumeType.description
              ? `${volumeType.name} (${volumeType.description})`
              : volumeType.name,
          }))
          .filter((choice) => choice.value !== resource.type),
      };
    },
    staleTime: UI_STALE_TIME,
  });

  const retypeMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      openstackVolumesRetype({
        path: { uuid: resource.uuid },
        body: { type: formData.type.value },
      }),
    successMessage: translate('Volume has been retyped.'),
    errorMessage: translate('Unable to retype volume.'),
    refetch,
  });

  return (
    <Form
      onSubmit={(values) =>
        retypeMutation.mutateAsync(values).catch(() => {
          /* error handled by useManagedMutation */
        })
      }
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <AsyncActionDialog
            title={translate('Retype OpenStack Volume')}
            loading={asyncState.isLoading}
            error={asyncState.error}
          >
            <p>
              <strong>{translate('Current type')}:</strong> {resource.type_name}
            </p>
            {asyncState.data?.types.length > 0 ? (
              <SelectGroup
                name="type"
                label={translate('Volume type')}
                options={asyncState.data.types}
                validate={required}
                required
              />
            ) : (
              <p>{translate('There are no other volume types available.')}</p>
            )}
          </AsyncActionDialog>
        </form>
      )}
    />
  );
};
