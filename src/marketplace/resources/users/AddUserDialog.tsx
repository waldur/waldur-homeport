import { FC, useCallback } from 'react';
import { Field, Form } from 'react-final-form';
import { marketplaceResourceUsersCreate, usersList } from 'waldur-js-client';

import { parseSelectData } from '@/core/api';
import { ENV } from '@/core/config';
import { returnReactSelectAsyncPaginateObject } from '@/core/utils';
import { required } from '@/core/validators';
import { SelectField, SubmitButton } from '@/form';
import { AsyncSelectFieldFinal } from '@/form/AsyncSelectField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { useModal } from '@/modal/hooks';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/hooks';

export const AddUserDialog: FC<{
  resolve: { resource; offering; refetch };
}> = ({ resolve }) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const update = useCallback(
    async (formData) => {
      try {
        await marketplaceResourceUsersCreate({
          body: {
            resource: resolve.resource.url,
            user: formData.user.url,
            role: formData.role.url,
          },
        });

        showSuccess(translate('User has been assigned successfully.'));
        if (resolve.refetch) await resolve.refetch();
        closeDialog();
      } catch (error) {
        showErrorResponse(error, translate('Unable to assign user.'));
      }
    },
    [
      resolve.resource,
      resolve.refetch,
      showSuccess,
      closeDialog,
      showErrorResponse,
    ],
  );

  const loadUsers = useCallback(
    (query, prevOptions, page) =>
      usersList({
        query: {
          full_name: query,
          project_uuid: resolve.resource.project_uuid,
          field: ['full_name', 'email', 'url', 'uuid'],
          o: ['full_name'],
          page,
          page_size: ENV.pageSize,
        },
      }).then((response) =>
        returnReactSelectAsyncPaginateObject(
          parseSelectData(response),
          prevOptions,
          page,
        ),
      ),
    [resolve.resource],
  );

  return (
    <Form onSubmit={update}>
      {({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Assign user')}
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  label={translate('Create')}
                  submitting={submitting}
                  disabled={invalid}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <FormGroup label={translate('User')} required>
              <AsyncSelectFieldFinal
                name="user"
                placeholder={translate('Select user...')}
                loadOptions={loadUsers}
                getOptionLabel={({ full_name, email }) =>
                  `${full_name} (${email})`
                }
                getOptionValue={({ uuid }) => uuid}
                validate={required}
              />
            </FormGroup>
            <FormGroup label={translate('Role')} required>
              <Field
                name="role"
                validate={required}
                component={SelectField}
                options={resolve.offering.roles}
                getOptionValue={(option) => option.uuid}
                getOptionLabel={(option) => option.name}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
