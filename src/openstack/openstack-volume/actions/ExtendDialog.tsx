import { useEffect, useCallback } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Field, reduxForm, change } from 'redux-form';
import { OpenStackVolume, openstackVolumesExtend } from 'waldur-js-client';

import { formatFilesize } from '@/core/utils';
import { FormFooter } from '@/form';
import { InputField } from '@/form/InputField';
import { translate } from '@/i18n';
import { parseIntField, formatIntField } from '@/marketplace/common/utils';
import { closeModalDialog } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { showSuccess, showErrorResponse } from '@/store/notify';

interface VolumeExtendDialogOwnProps {
  resolve: { resource: OpenStackVolume; refetch };
}

interface VolumeExtendDialogFormData {
  size: number;
}

export const VolumeExtendDialog = reduxForm<
  VolumeExtendDialogFormData,
  VolumeExtendDialogOwnProps
>({ form: 'VolumeExtendDialog' })(({
  resolve: { resource, refetch },
  submitting,
  handleSubmit,
}) => {
  const dispatch = useDispatch();

  const minSize = Math.round(resource.size / 1024) + 1;

  useEffect(() => {
    dispatch(change('VolumeExtendDialog', 'size', minSize));
  }, [dispatch, minSize]);

  const extendVolume = useCallback(
    async (formData: VolumeExtendDialogFormData) => {
      try {
        await openstackVolumesExtend({
          path: { uuid: resource.uuid },
          body: {
            disk_size: formData.size * 1024,
          },
        });
        dispatch(
          showSuccess(translate('Volume extension has been scheduled.')),
        );
        dispatch(closeModalDialog());
        if (refetch) {
          await refetch();
        }
      } catch (e) {
        dispatch(showErrorResponse(e, translate('Unable to extend volume.')));
      }
    },
    [resource, dispatch],
  );
  return (
    <form onSubmit={handleSubmit(extendVolume)}>
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
              component={InputField}
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
  );
});
