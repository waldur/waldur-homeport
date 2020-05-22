import * as React from 'react';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import InputGroupAddon from 'react-bootstrap/lib/InputGroupAddon';
import ModalBody from 'react-bootstrap/lib/ModalBody';
import ModalFooter from 'react-bootstrap/lib/ModalFooter';
import ModalHeader from 'react-bootstrap/lib/ModalHeader';
import ModalTitle from 'react-bootstrap/lib/ModalTitle';
import { useDispatch } from 'react-redux';
import { Field, reduxForm, change } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { post } from '@waldur/core/api';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { InputField } from '@waldur/issues/create/InputField';
import {
  parseIntField,
  formatIntField,
} from '@waldur/marketplace/common/utils';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { BaseResource } from '@waldur/resource/types';
import { showSuccess, showError } from '@waldur/store/coreSaga';

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

    React.useEffect(() => {
      dispatch(change('VolumeExtendDialog', 'size', minSize));
    }, [dispatch, minSize]);

    const extendVolume = React.useCallback(
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
