import * as React from 'react';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ModalBody from 'react-bootstrap/lib/ModalBody';
import ModalFooter from 'react-bootstrap/lib/ModalFooter';
import ModalHeader from 'react-bootstrap/lib/ModalHeader';
import ModalTitle from 'react-bootstrap/lib/ModalTitle';
import { useDispatch } from 'react-redux';
import { Field, reduxForm, change } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { post } from '@waldur/core/api';
import { ENV } from '@waldur/core/services';
import { LATIN_NAME_PATTERN } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { InputField } from '@waldur/issues/create/InputField';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { BaseResource } from '@waldur/resource/types';
import { showSuccess, showError } from '@waldur/store/coreSaga';

interface Volume extends BaseResource {
  size: number;
}

interface SnapshotCreateDialogOwnProps {
  resolve: { resource: Volume };
}

interface SnapshotCreateDialogFormData {
  name: string;
  description?: string;
}

export const SnapshotCreateDialog = reduxForm<
  SnapshotCreateDialogFormData,
  SnapshotCreateDialogOwnProps
>({ form: 'SnapshotCreateDialog' })(
  ({ resolve: { resource }, submitting, handleSubmit }) => {
    const dispatch = useDispatch();
    const extendVolume = React.useCallback(
      async (formData: SnapshotCreateDialogFormData) => {
        const payload = {
          name: formData.name,
          description: formData.description,
        };
        try {
          await post(
            `/openstacktenant-volumes/${resource.uuid}/snapshot/`,
            payload,
          );
          dispatch(showSuccess(translate('Snapshot has been created.')));
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(showError(translate('Unable to create snapshot.')));
        }
      },
      [resource, dispatch],
    );

    React.useEffect(() => {
      dispatch(
        change('SnapshotCreateDialog', 'name', resource.name + '-snapshot'),
      );
    }, [dispatch, resource]);

    return (
      <form onSubmit={handleSubmit(extendVolume)}>
        <ModalHeader>
          <ModalTitle>
            {translate('Create snapshot for OpenStack volume')}
          </ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p>
            <strong>{translate('Volume name')}:</strong> {resource.name}
          </p>

          <FormGroup>
            <ControlLabel>{translate('Snapshot name')}:</ControlLabel>
            <Field
              name="name"
              component={InputField}
              type="text"
              pattern={
                ENV.enforceLatinName ? LATIN_NAME_PATTERN.source : undefined
              }
              required={true}
              disabled={submitting}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>{translate('Description')}:</ControlLabel>
            <Field
              name="description"
              component={InputField}
              componentClass="textarea"
              disabled={submitting}
            />
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
