import { useEffect, useCallback } from 'react';
import {
  ControlLabel,
  FormGroup,
  InputGroup,
  InputGroupAddon,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap';
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
import { showSuccess, showError } from '@waldur/store/notify';

interface Volume extends BaseResource {
  size: number;
}

interface VolumeExtendDialogOwnProps {
  resolve: { resource: Volume };
}

interface VolumeExtendDialogFormData {
  size: number;
}

export const VolumeExtendDialog = reduxForm<
  VolumeExtendDialogFormData,
  VolumeExtendDialogOwnProps
>({ form: 'VolumeExtendDialog' })(
  ({ resolve: { resource }, submitting, handleSubmit }) => {
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
          dispatch(showSuccess(translate('Volume has been extended.')));
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(showError(translate('Unable to extend volume.')));
        }
      },
      [resource, dispatch],
    );
    return (
      <form onSubmit={handleSubmit(extendVolume)}>
        <ModalHeader>
          <ModalTitle>{translate('Extend OpenStack volume')}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p>
            <strong>{translate('Volume name')}:</strong> {resource.name}
          </p>

          <p>
            <strong>{translate('Current size')}:</strong>{' '}
            {formatFilesize(resource.size)}
          </p>

          <FormGroup>
            <ControlLabel>{translate('New size')}:</ControlLabel>
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
              <InputGroupAddon>{translate('GB')}</InputGroupAddon>
            </InputGroup>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <SubmitButton
            block={false}
            submitting={submitting}
            label={translate('Submit')}
          />
          <CloseDialogButton />
        </ModalFooter>
      </form>
    );
  },
);
