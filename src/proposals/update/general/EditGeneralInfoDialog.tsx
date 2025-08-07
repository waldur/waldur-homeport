import { FORM_ERROR } from 'final-form';
import { pick } from 'lodash-es';
import { useCallback } from 'react';
import { Form, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { proposalProtectedCallsPartialUpdate } from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import {
  NumberField,
  SubmitButton,
  StringField,
  FieldError,
} from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { FormContainer } from '@waldur/form/FormContainer';
import MarkdownEditor from '@waldur/form/MarkdownEditor';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { closeModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { EditCallProps } from '@waldur/proposals/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface FormData {
  name: string;
  description: string;
  fixed_duration_in_days?: number | null;
}

interface Props {
  resolve: EditCallProps;
}

export const EditGeneralInfoDialog = ({ resolve }: Props) => {
  const dispatch = useDispatch();
  const initialValues = pick(resolve.call, resolve.name);

  const processRequest = useCallback(
    async (values: FormData) => {
      if (values.fixed_duration_in_days) {
        try {
          await waitForConfirmation(
            dispatch,
            translate('Confirmation'),
            translate(
              'This will also update durations of connected proposals in Draft or In Review states. Continue?',
            ),
          );
        } catch {
          return;
        }
      }
      const body: any = {};

      if (resolve.name === 'fixed_duration_in_days') {
        body.fixed_duration_in_days = values.fixed_duration_in_days || null;
      } else {
        body[resolve.name] = values[resolve.name];
      }

      try {
        await proposalProtectedCallsPartialUpdate({
          path: { uuid: resolve.call.uuid },
          body,
        });
        resolve.refetch();
        dispatch(showSuccess(translate('The call has been updated.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(showErrorResponse(e, translate('Unable to update call.')));
        if (e.response && e.response.status === 400) {
          return { [FORM_ERROR]: e.response.data };
        }
        return { [FORM_ERROR]: translate('Unable to update call.') };
      }
    },
    [resolve, dispatch],
  );

  return (
    <Form
      onSubmit={processRequest}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={resolve.title}
            closeButton
            footer={
              <>
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Save')}
                />

                <CloseDialogButton />
              </>
            }
          >
            <FormContainer submitting={submitting} className="size-lg">
              {resolve.name === 'name' && (
                <FormGroup label={translate('Name')} required>
                  <Field
                    name="name"
                    component={StringField as any}
                    validate={required}
                  />
                  <Field
                    name="name"
                    component={({ meta }) =>
                      meta.touched && meta.error ? (
                        <FieldError error={meta.error} />
                      ) : null
                    }
                  />
                </FormGroup>
              )}
              {resolve.name === 'description' && (
                <FormGroup>
                  <Field
                    name="description"
                    component={MarkdownEditor as any}
                    required
                    autoFocus
                    hideLabel
                    spaceless
                  />
                </FormGroup>
              )}
              {resolve.name === 'reference_code' && (
                <FormGroup label={translate('Reference code')}>
                  <Field name="reference_code" component={StringField as any} />
                  <Field
                    name="reference_code"
                    component={({ meta }) =>
                      meta.touched && meta.error ? (
                        <FieldError error={meta.error} />
                      ) : null
                    }
                  />
                </FormGroup>
              )}
              {resolve.name === 'external_url' && (
                <FormGroup label={translate('External URL')} required>
                  <Field
                    name="external_url"
                    component={StringField as any}
                    validate={required}
                  />
                  <Field
                    name="external_url"
                    component={({ meta }) =>
                      meta.touched && meta.error ? (
                        <FieldError error={meta.error} />
                      ) : null
                    }
                  />
                </FormGroup>
              )}
              {(resolve.name === 'reviews_visible_to_submitters' ||
                resolve.name === 'reviewer_identity_visible_to_submitters') && (
                <FormGroup>
                  <Field
                    name={resolve.name}
                    component={AwesomeCheckboxField as any}
                    label={resolve.title}
                  />
                </FormGroup>
              )}
              {resolve.name === 'fixed_duration_in_days' && (
                <FormGroup
                  label={translate(
                    'Fixed duration for granted projects (in days)',
                  )}
                >
                  <Field
                    name="fixed_duration_in_days"
                    component={NumberField as any}
                  />
                  <Field
                    name="fixed_duration_in_days"
                    component={({ meta }) =>
                      meta.touched && meta.error ? (
                        <FieldError error={meta.error} />
                      ) : null
                    }
                  />
                </FormGroup>
              )}
            </FormContainer>
          </ModalDialog>
        </form>
      )}
    />
  );
};
