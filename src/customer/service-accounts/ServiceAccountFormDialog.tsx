import { PencilSimpleIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
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

import { lazyComponent } from '@waldur/core/lazyComponent';
import {
  FormContainer,
  StringField,
  SubmitButton,
  TextField,
} from '@waldur/form';
import { EmailField } from '@waldur/form/EmailField';
import { translate } from '@waldur/i18n';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

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

export const ServiceAccountFormDialog = reduxForm<
  ServiceAccountFormData,
  OwnProps
>({
  form: 'SERVICE_ACCOUNT_FORM_ID',
})(({
  resolve: { row, context, scope, refetch },
  submitting,
  handleSubmit,
}) => {
  const dispatch = useDispatch();

  const isEdit = useMemo(() => !!row?.uuid, [row]);

  const save = useCallback(
    async (formData: ServiceAccountFormData) => {
      try {
        const {
          preferred_identifier: _,
          username: __,
          ...updateData
        } = formData;
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
          dispatch(closeModalDialog());
        } else {
          const api =
            context === 'customer'
              ? marketplaceCustomerServiceAccountsCreate
              : marketplaceProjectServiceAccountsCreate;
          response = await api({ body } as any);
          dispatch(closeModalDialog());
          // Open a dialog to show the API key
          dispatch(
            openModalDialog(ServiceAccountShowInfoDialog, {
              resolve: {
                username: response.data.username,
                token: response.data.token,
                expiresAt: response.data.expires_at,
              },
            }),
          );
        }

        dispatch(
          showSuccess(
            isEdit
              ? translate('Service account has been updated.')
              : translate('Service account has been created.'),
          ),
        );
        if (refetch) refetch();
      } catch (e) {
        dispatch(
          showErrorResponse(
            e,
            isEdit
              ? translate('Unable to edit service account.')
              : translate("'Unable to create service account.'"),
          ),
        );
      }
    },
    [dispatch, scope, refetch, isEdit, row],
  );

  return (
    <form onSubmit={handleSubmit(save)}>
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
        closeButton
        footer={
          <>
            <CloseDialogButton className="min-w-125px" />
            <SubmitButton
              submitting={submitting}
              label={isEdit ? translate('Save') : translate('Create')}
              className="btn btn-primary min-w-125px"
            />
          </>
        }
      >
        <FormContainer submitting={submitting}>
          <StringField
            name={isEdit ? 'username' : 'preferred_identifier'}
            label={
              isEdit ? translate('Username') : translate('Preferred identifier')
            }
            placeholder={translate('e.g.') + ' backup'}
            autoFocus
            disabled={isEdit}
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
            placeholder={translate('e.g.') + ' serviceaccount@example.com'}
            description={translate(
              'Email for receiving notifications about events connected with the service account.',
            )}
          />

          <TextField
            name="description"
            label={translate('Description')}
            placeholder={translate('e.g. Used for automated backups')}
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
