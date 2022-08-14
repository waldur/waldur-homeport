import React from 'react';
import { useDispatch } from 'react-redux';
import { InjectedFormProps, reduxForm, SubmissionError } from 'redux-form';

import { FormContainer } from '@waldur/form/FormContainer';
import { StringField } from '@waldur/form/StringField';
import { SubmitButton } from '@waldur/form/SubmitButton';
import { TextField } from '@waldur/form/TextField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { createEntity } from '@waldur/table/actions';

import { createKey } from './api';
import * as constants from './constants';

interface FormData {
  name: string;
  public_key: string;
}

const extractNameFromKey = (publicKey: string) => {
  if (publicKey) {
    const key = publicKey.split(' ');
    if (key.length === 3 && key[2]) {
      return key[2].trim();
    }
  }
  return '';
};

const PureKeyCreateDialog: React.FC<InjectedFormProps<FormData>> = (props) => {
  const dispatch = useDispatch();

  const change = props.change;

  const processRequest = React.useCallback(
    async (values: FormData) => {
      let data = { ...values };
      try {
        if (!values.name) {
          const name = extractNameFromKey(values.public_key);
          data = { ...values, name };
          change('name', name);
        }
        const response = await createKey(data);
        const createdKey = response.data;
        dispatch(
          createEntity(constants.keysListTable, createdKey.uuid, createdKey),
        );
        dispatch(showSuccess(translate('The key has been created.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(showErrorResponse(e, translate('Unable to create key.')));
        if (e.response && e.response.status === 400) {
          throw new SubmissionError(e.response.data);
        }
      }
    },
    [dispatch, change],
  );

  return (
    <form onSubmit={props.handleSubmit(processRequest)}>
      <ModalDialog
        title={translate('Import public key')}
        closeButton
        footer={
          <>
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Import key')}
            />
          </>
        }
      >
        <FormContainer submitting={props.submitting}>
          <StringField label={translate('Key name')} name="name" />
          <TextField
            label={translate('Public key')}
            name="public_key"
            required={true}
            style={{ height: 100 }}
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
};

export const KeyCreateDialog = reduxForm<FormData>({ form: 'keyCreate' })(
  PureKeyCreateDialog,
);
