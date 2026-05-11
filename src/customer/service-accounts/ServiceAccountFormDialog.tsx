import { PencilSimpleIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  CustomerServiceAccount,
  CustomerServiceAccountRequest,
  marketplaceCustomerServiceAccountsCreate,
  marketplaceCustomerServiceAccountsPartialUpdate,
  marketplaceProjectServiceAccountsCreate,
  marketplaceProjectServiceAccountsPartialUpdate,
  ProjectServiceAccount,
  ProjectServiceAccountRequest,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { required, email } from '@/core/validators';
import {
  FormContainerFinal,
  StringField,
  SubmitButton,
  TextField,
} from '@/form';
import { EmailField } from '@/form/EmailField';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';

import { ServiceAccountsProps } from './type';

interface OwnProps {
  resolve: ServiceAccountsProps & {
    refetch(): void;
    row?: CustomerServiceAccount | ProjectServiceAccount;
  };
}

interface ServiceAccountFormData {
  preferred_identifier?: string;
  username?: string;
  email: string;
  description: string;
}

const ServiceAccountShowInfoDialog = lazyComponent(() =>
  import('./ServiceAccountShowInfoDialog').then((module) => ({
    default: module.ServiceAccountShowInfoDialog,
  })),
);

export const ServiceAccountFormDialog: FC<OwnProps> = ({
  resolve: { row, context, scope, refetch },
}) => {
  const { showErrorResponse, showSuccess } = useNotify();
  const { openDialog, closeDialog } = useModal();

  const isEdit = useMemo(() => !!row?.uuid, [row]);

  const initialValues = useMemo(
    () => row || ({} as ServiceAccountFormData),
    [row],
  );

  const save = async (formData: ServiceAccountFormData) => {
    try {
      const { preferred_identifier: _, username: __, ...updateData } = formData;
      const body =
        context === 'customer'
          ? ({
              ...(isEdit ? updateData : formData),
              customer: scope.uuid,
            } as CustomerServiceAccountRequest)
          : ({
              ...(isEdit ? updateData : formData),
              project: scope.uuid,
            } as ProjectServiceAccountRequest);

      let response;
      if (isEdit) {
        const api =
          context === 'customer'
            ? marketplaceCustomerServiceAccountsPartialUpdate
            : marketplaceProjectServiceAccountsPartialUpdate;
        response = await api({
          path: { uuid: row.uuid },
          body,
        });
        closeDialog();
      } else {
        const api =
          context === 'customer'
            ? marketplaceCustomerServiceAccountsCreate
            : marketplaceProjectServiceAccountsCreate;
        response = await api({ body } as any);
        closeDialog();
        // Open a dialog to show the API key
        openDialog(ServiceAccountShowInfoDialog, {
          resolve: {
            username: response.data.username,
            token: response.data.token,
            expiresAt: response.data.expires_at,
          },
        });
      }

      showSuccess(
        isEdit
          ? translate('Service account has been updated.')
          : translate('Service account has been created.'),
      );
      if (refetch) refetch();
    } catch (e) {
      showErrorResponse(
        e,
        isEdit
          ? translate('Unable to edit service account.')
          : translate('Unable to create service account.'),
      );
    }
  };

  return (
    <Form<ServiceAccountFormData>
      onSubmit={save}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit service account')
                : translate('Create service account')
            }
            iconNode={
              isEdit ? (
                <PencilSimpleIcon weight="bold" />
              ) : (
                <PlusCircleIcon weight="bold" />
              )
            }
            iconColor="success"
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  submitting={submitting}
                  label={isEdit ? translate('Save') : translate('Create')}
                  disabled={invalid}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <FormContainerFinal submitting={submitting}>
              <StringField
                name={isEdit ? 'username' : 'preferred_identifier'}
                label={
                  isEdit
                    ? translate('Username')
                    : translate('Preferred identifier')
                }
                placeholder={translate('e.g. backup')}
                autoFocus
                disabled={isEdit}
                validate={isEdit ? undefined : required}
                required={!isEdit}
                description={
                  isEdit
                    ? translate('Username of the service account.')
                    : translate(
                        'Suggest an identifier to include into the generated username of the service account.',
                      )
                }
              />

              <EmailField
                name="email"
                label={translate('Notification email')}
                placeholder={translate('e.g. serviceaccount@example.com')}
                validate={email}
                description={translate(
                  'Email for receiving notifications about events connected with the service account.',
                )}
              />

              <TextField
                name="description"
                label={translate('Description')}
                placeholder={translate('e.g. Used for automated backups')}
              />
            </FormContainerFinal>
          </ModalDialog>
        </form>
      )}
    />
  );
};
