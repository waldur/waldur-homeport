import { pick } from 'lodash';
import { useCallback } from 'react';
import { connect } from 'react-redux';
import { SubmissionError, reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import { SubmitButton, TextField } from '@waldur/form';
import { FormContainer } from '@waldur/form/FormContainer';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';

import { EditUserProps } from '../types';

type FormData = Record<string, any>;

export const EditFieldDialog = connect<{}, {}, { resolve: EditUserProps }>(
  (_, ownProps) => ({
    initialValues: pick(ownProps.resolve.user, ownProps.resolve.name),
  }),
)(
  reduxForm<FormData, { resolve: EditUserProps }>({
    form: 'UserInfoForm',
  })((props) => {
    const processRequest = useCallback(
      (values: FormData, dispatch) => {
        return props.resolve
          .callback(values, dispatch)
          .then(() => {
            dispatch(closeModalDialog());
          })
          .catch((e) => {
            if (e.response && e.response.status === 400) {
              throw new SubmissionError(e.response.data);
            }
          });
      },
      [props.resolve.callback],
    );

    return (
      <form onSubmit={props.handleSubmit(processRequest)}>
        <MetronicModalDialog
          headerLess
          footer={
            <>
              <CloseDialogButton
                variant="outline btn-outline-default"
                className="flex-equal"
              />
              <SubmitButton
                disabled={props.invalid || !props.dirty}
                submitting={props.submitting}
                label={translate('Submit')}
                className="btn btn-primary flex-equal"
              />
            </>
          }
        >
          <FormContainer submitting={props.submitting}>
            {props.resolve.name === 'description' ? (
              <TextField
                name="description"
                label={translate('Description')}
                required={Boolean(props.resolve.requiredMsg)}
                validate={props.resolve.requiredMsg ? required : null}
                maxLength={500}
                spaceless
              />
            ) : props.resolve.name ? (
              <StringField
                name={props.resolve.name}
                label={props.resolve.label}
                required={Boolean(props.resolve.requiredMsg)}
                validate={props.resolve.requiredMsg ? required : null}
                spaceless
              />
            ) : null}
          </FormContainer>
        </MetronicModalDialog>
      </form>
    );
  }),
);
