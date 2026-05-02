import { FC, useMemo } from 'react';
import { Field, Form as FinalForm } from 'react-final-form';
import {
  PatchedRequestTypeAdminRequest,
  RequestTypeAdmin,
  RequestTypeAdminRequest,
  supportRequestTypesAdminCreate,
  supportRequestTypesAdminPartialUpdate,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { NumberField, StringField, SubmitButton } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface RequestTypeFormProps {
  resolve: {
    requestType?: RequestTypeAdmin;
    refetch: () => void;
  };
}

export const RequestTypeForm: FC<RequestTypeFormProps> = ({ resolve }) => {
  const isEdit = Boolean(resolve.requestType?.uuid);

  const saveRequestTypeMutation = useManagedMutation<
    any,
    any,
    Partial<RequestTypeAdmin>
  >({
    mutationFn: (values) => {
      if (isEdit) {
        return supportRequestTypesAdminPartialUpdate({
          path: { uuid: resolve.requestType!.uuid },
          body: values as PatchedRequestTypeAdminRequest,
        });
      } else {
        return supportRequestTypesAdminCreate({
          body: values as RequestTypeAdminRequest,
        });
      }
    },
    successMessage: isEdit
      ? translate('Request type has been updated.')
      : translate('Request type has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update request type.')
      : translate('Unable to create request type.'),
    refetch: resolve.refetch,
  });

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
    <FinalForm
      onSubmit={(values) => saveRequestTypeMutation.mutateAsync(values)}
      initialValues={initialValues}
    >
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
