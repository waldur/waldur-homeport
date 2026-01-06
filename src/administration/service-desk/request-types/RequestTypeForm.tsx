import { FC, useCallback, useMemo } from 'react';
import { Field, Form as FinalForm } from 'react-final-form';

import { required } from '@waldur/core/validators';
import { NumberField, StringField, SubmitButton } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

import { createRequestType, RequestTypeAdmin, updateRequestType } from './api';

interface RequestTypeFormProps {
  resolve: {
    requestType?: RequestTypeAdmin;
    refetch: () => void;
  };
}

export const RequestTypeForm: FC<RequestTypeFormProps> = ({ resolve }) => {
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const isEdit = Boolean(resolve.requestType?.uuid);

  const submitForm = useCallback(
    async (values: Partial<RequestTypeAdmin>) => {
      try {
        if (isEdit) {
          await updateRequestType(resolve.requestType!.uuid, values);
          showSuccess(translate('Request type has been updated.'));
        } else {
          await createRequestType(values);
          showSuccess(translate('Request type has been created.'));
        }
        resolve.refetch();
        closeDialog();
      } catch (error) {
        showErrorResponse(
          error,
          isEdit
            ? translate('Unable to update request type.')
            : translate('Unable to create request type.'),
        );
      }
    },
    [resolve, isEdit, showSuccess, showErrorResponse, closeDialog],
  );

  const initialValues = useMemo(() => {
    if (isEdit && resolve.requestType) {
      return {
        name: resolve.requestType.name || '',
        issue_type_name: resolve.requestType.issue_type_name || '',
        order: resolve.requestType.order || 0,
        is_active: resolve.requestType.is_active ?? true,
      };
    }
    return {
      name: '',
      issue_type_name: '',
      order: 0,
      is_active: true,
    };
  }, [isEdit, resolve.requestType]);

  return (
    <FinalForm onSubmit={submitForm} initialValues={initialValues}>
      {({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit request type')
                : translate('Create request type')
            }
            closeButton
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={isEdit ? translate('Update') : translate('Create')}
              />
            }
          >
            <FormGroup label={translate('Name')} required>
              <Field
                component={StringField as any}
                name="name"
                validate={required}
                disabled={isEdit && resolve.requestType?.is_synced}
              />
              {isEdit && resolve.requestType?.is_synced && (
                <small className="text-muted">
                  {translate(
                    'Name cannot be changed for synced request types.',
                  )}
                </small>
              )}
            </FormGroup>

            <FormGroup label={translate('Issue type name')} required>
              <Field
                component={StringField as any}
                name="issue_type_name"
                validate={required}
                disabled={isEdit && resolve.requestType?.is_synced}
              />
              {isEdit && resolve.requestType?.is_synced && (
                <small className="text-muted">
                  {translate(
                    'Issue type name cannot be changed for synced request types.',
                  )}
                </small>
              )}
            </FormGroup>

            <FormGroup label={translate('Order')}>
              <Field component={NumberField as any} name="order" min={0} />
              <small className="text-muted">
                {translate(
                  'Display order. First type (lowest order) is the default.',
                )}
              </small>
            </FormGroup>

            <FormGroup>
              <Field
                component={AwesomeCheckboxField as any}
                name="is_active"
                label={translate('Active')}
              />
              <small className="text-muted">
                {translate(
                  'Active request types are available for issue creation.',
                )}
              </small>
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    </FinalForm>
  );
};
