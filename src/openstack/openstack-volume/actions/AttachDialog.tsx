import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  openstackInstancesList,
  openstackVolumesAttach,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { AsyncSelectGroup, FormFooter } from '@/form';
import { createLoadOptions } from '@/form/select';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionDialogProps } from '@/resource/actions/types';

export const AttachDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const mutation = useManagedMutation<any, any, { instance: any }>({
    mutationFn: (formData) =>
      openstackVolumesAttach({
        path: { uuid: resource.uuid },
        body: {
          instance:
            typeof formData.instance === 'object'
              ? formData.instance.url
              : formData.instance,
        },
      }),

    successMessage: translate('Volume has been attached to instance.'),
    errorMessage: translate('Unable to attach volume to instance.'),
    refetch: refetch,
  });

  return (
    <Form
      onSubmit={mutation.mutateAsync}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Attach OpenStack Volume to Instance')}
            footer={<FormFooter />}
          >
            <AsyncSelectGroup
              name="instance"
              label={translate('Instance')}
              required={true}
              defaultOptions={true}
              loadOptions={createLoadOptions(openstackInstancesList, 'name', {
                attach_volume_uuid: resource.uuid,
                field: ['url', 'name'],
              })}
              getOptionValue={(option) => option.url}
              getOptionLabel={(option) => option.name}
              isClearable={false}
              validate={required}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
