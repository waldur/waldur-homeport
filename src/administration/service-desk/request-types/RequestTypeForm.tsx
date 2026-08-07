import { FC, useMemo } from 'react';
import { Form as FinalForm } from 'react-final-form';
import {
  PatchedRequestTypeAdminRequest,
  RequestTypeAdmin,
  RequestTypeAdminRequest,
  supportRequestTypesAdminCreate,
  supportRequestTypesAdminPartialUpdate,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { BooleanGroup, NumberGroup, StringGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
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
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={isEdit ? translate('Update') : translate('Create')}
              />
            }
          >
            <StringGroup
              label={translate('Name')}
              name="name"
              validate={required}
              disabled={isEdit && resolve.requestType?.is_synced}
              required
              description={
                isEdit &&
                resolve.requestType?.is_synced &&
                translate('Name cannot be changed for synced request types.')
              }
            />

            <StringGroup
              label={translate('Issue type name')}
              name="issue_type_name"
              validate={required}
              disabled={isEdit && resolve.requestType?.is_synced}
              required
              description={
                isEdit &&
                resolve.requestType?.is_synced &&
                translate(
                  'Issue type name cannot be changed for synced request types.',
                )
              }
            />

            <NumberGroup
              label={translate('Display order')}
              name="order"
              min={0}
              parse={Number}
              description={translate(
                'Display order. First type (lowest order) is the default.',
              )}
            />

            <BooleanGroup
              label={translate('Active')}
              name="is_active"
              description={translate(
                'Active request types are available for issue creation.',
              )}
            />
          </ModalDialog>
        </form>
      )}
    </FinalForm>
  );
};
