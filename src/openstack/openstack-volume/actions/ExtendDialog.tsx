import { Form, InputGroup } from 'react-bootstrap';
import { Form as FinalForm, Field } from 'react-final-form';
import { OpenStackVolume, openstackVolumesExtend } from 'waldur-js-client';

import { formatFilesize } from '@/core/utils';
import { FormFooter } from '@/form';
import { InputField } from '@/form/InputField';
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
    <FinalForm<VolumeExtendDialogFormData>
      initialValues={{ size: minSize }}
      onSubmit={(formData) => extendMutation.mutateAsync(formData)}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Extend OpenStack volume')}
            footer={<FormFooter submitting={submitting} />}
          >
            <p>
              <strong>{translate('Volume name')}:</strong> {resource.name}
            </p>

            <p>
              <strong>{translate('Current size')}:</strong>{' '}
              {formatFilesize(resource.size)}
            </p>

            <Form.Group>
              <Form.Label>{translate('New size')}:</Form.Label>
              <InputGroup>
                <Field
                  name="size"
                  component={InputField as any}
                  type="number"
                  required={true}
                  min={minSize}
                  disabled={submitting}
                  parse={parseIntField}
                  format={formatIntField}
                />

                <InputGroup.Text>{translate('GB')}</InputGroup.Text>
              </InputGroup>
            </Form.Group>
          </ModalDialog>
        </form>
      )}
    />
  );
};
