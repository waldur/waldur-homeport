import { Form } from 'react-final-form';
import { OpenStackVolume, openstackVolumesExtend } from 'waldur-js-client';

import { formatFilesize } from '@/core/utils';
import { FormFooter, NumberGroup } from '@/form';
import { translate } from '@/i18n';
import { parseIntField, formatIntField } from '@/marketplace/common/utils';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface VolumeExtendDialogOwnProps {
  resolve: { resource: OpenStackVolume; refetch };
}

interface VolumeExtendDialogFormData {
  size: number;
}

export const VolumeExtendDialog = ({
  resolve: { resource, refetch },
}: VolumeExtendDialogOwnProps) => {
  const minSize = Math.round(resource.size / 1024) + 1;

  const extendMutation = useManagedMutation<
    any,
    any,
    VolumeExtendDialogFormData
  >({
    mutationFn: (formData) =>
      openstackVolumesExtend({
        path: { uuid: resource.uuid },
        body: {
          disk_size: formData.size * 1024,
        },
      }),
    successMessage: translate('Volume extension has been scheduled.'),
    errorMessage: translate('Unable to extend volume.'),
    refetch,
  });

  return (
    <Form<VolumeExtendDialogFormData>
      initialValues={{ size: minSize }}
      onSubmit={(formData) => extendMutation.mutateAsync(formData)}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Extend OpenStack volume')}
            footer={<FormFooter />}
          >
            <p>
              <strong>{translate('Volume name')}:</strong> {resource.name}
            </p>

            <p>
              <strong>{translate('Current size')}:</strong>{' '}
              {formatFilesize(resource.size)}
            </p>

            <NumberGroup
              name="size"
              label={translate('New size')}
              required={true}
              min={minSize}
              parse={parseIntField}
              format={formatIntField}
              unit={translate('GB')}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
