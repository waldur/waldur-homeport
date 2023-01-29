import { useEffect, useCallback } from 'react';
import { Form, InputGroup, Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Field, reduxForm, change } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { post } from '@waldur/core/api';
import { formatFilesize } from '@waldur/core/utils';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';
import {
  parseIntField,
  formatIntField,
} from '@waldur/marketplace/common/utils';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { BaseResource } from '@waldur/resource/types';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

interface Volume extends BaseResource {
  size: number;
}

interface VolumeExtendDialogOwnProps {
  resolve: { resource: Volume; refetch };
}

interface VolumeExtendDialogFormData {
  size: number;
}

export const VolumeExtendDialog = reduxForm<
  VolumeExtendDialogFormData,
  VolumeExtendDialogOwnProps
>({ form: 'VolumeExtendDialog' })(
  ({ resolve: { resource, refetch }, submitting, handleSubmit }) => {
    const dispatch = useDispatch();

    const minSize = Math.round(resource.size / 1024) + 1;

    useEffect(() => {
      dispatch(change('VolumeExtendDialog', 'size', minSize));
    }, [dispatch, minSize]);

    const extendVolume = useCallback(
      async (formData: VolumeExtendDialogFormData) => {
        const payload = {
          disk_size: formData.size * 1024,
        };
        try {
          await post(
            `/openstacktenant-volumes/${resource.uuid}/extend/`,
            payload,
          );
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
        <Modal.Header>
          <Modal.Title>{translate('Extend OpenStack volume')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
        </Modal.Body>
        <Modal.Footer>
          <CloseDialogButton />
          <SubmitButton
            block={false}
            submitting={submitting}
            label={translate('Submit')}
          />
        </Modal.Footer>
      </form>
    );
  },
);
