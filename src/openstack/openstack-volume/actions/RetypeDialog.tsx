import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import { openstackVolumesRetype } from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { required } from '@/core/validators';
import { Select } from '@/form/themed-select';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { useModal } from '@/modal/hooks';
import { loadVolumeTypes } from '@/openstack/api';
import { AsyncActionDialog } from '@/resource/actions/AsyncActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { useNotify } from '@/store/hooks';

export const RetypeDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const { showErrorResponse, showSuccess } = useNotify();
  const { closeDialog } = useModal();

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

  const submitRequest = async (formData) => {
    try {
      await openstackVolumesRetype({
        path: { uuid: resource.uuid },
        body: { type: formData.type.value },
      });
      showSuccess(translate('Volume has been retyped.'));
      closeDialog();
      if (refetch) {
        await refetch();
      }
    } catch (e) {
      showErrorResponse(e, translate('Unable to retype volume.'));
    }
  };

  return (
    <Form
      onSubmit={submitRequest}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <AsyncActionDialog
            title={translate('Retype OpenStack Volume')}
            loading={asyncState.isLoading}
            error={asyncState.error}
            submitting={submitting}
            invalid={invalid}
          >
            <p>
              <strong>{translate('Current type')}:</strong> {resource.type_name}
            </p>
            {asyncState.data?.types.length > 0 ? (
              <FormGroup label={translate('Volume type')} required>
                <Field
                  name="type"
                  validate={required}
                  render={({ input }) => (
                    <Select {...input} options={asyncState.data.types} />
                  )}
                />
              </FormGroup>
            ) : (
              <p>{translate('There are no other volume types available.')}</p>
            )}
          </AsyncActionDialog>
        </form>
      )}
    />
  );
};
