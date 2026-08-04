import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FORM_ERROR } from 'final-form';
import { FC, useCallback } from 'react';
import { Field, Form } from 'react-final-form';
import {
  rolesCreate,
  rolesRetrieve,
  rolesUpdate,
  RoleDetails,
  RoleModifyRequest,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { composeValidators, required } from '@/core/validators';
import { SubmitButton, StringGroup, SelectGroup } from '@/form';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';

import { ROLE_TYPES } from '../../permissions/constants';

import { PermissionField } from './PermissionField';
import { getRoles, isRoleCode } from './utils';

interface RoleFormDialogProps {
  resolve: {
    row?: RoleDetails;
    refetch(): void;
  };
}

const RoleForm: FC<{ role?: RoleDetails }> = (props) => {
  // An organization role's code encodes its owning organization and its scope
  // binds it there, so both are fixed — same as system roles.
  const isOrgScoped = Boolean(props.role?.customer_uuid);
  const codeLocked = props.role?.is_system_role || isOrgScoped;
  const isNew = !props.role;
  return (
    <>
      {/*
        The human-readable label lives in `description`; `name` is the technical
        code. Collected on create only: on edit, `description_<lang>` values are
        round-tripped through the same PUT, and modeltranslation resolves
        `description` from the active language field, so editing the base value
        here could silently be overwritten. Editing goes through the dedicated
        per-language dialog (RoleDescriptionEditDialog) instead.
      */}
      {isNew ? (
        <StringGroup
          name="description"
          validate={required}
          label={translate('Name')}
          description={translate(
            'Human-readable name shown to users throughout the portal.',
          )}
          placeholder={translate('e.g. Researcher')}
          required
        />
      ) : (
        <StringGroup
          name="description"
          label={translate('Name')}
          disabled
          description={translate(
            'Editable, together with its translations, from the "Edit name translations" action.',
          )}
        />
      )}
      <StringGroup
        name="name"
        label={translate('Code')}
        disabled={codeLocked}
        placeholder="PROJECT.RESEARCHER"
        description={
          isOrgScoped
            ? translate(
                'The code of an organization role is fixed; only its name and permissions can be changed.',
              )
            : translate(
                'Permanent technical identifier used by the API and by permission checks. It cannot be changed once the role has been created.',
              )
        }
        validate={isNew ? composeValidators(required, isRoleCode) : required}
        required
      />
      <SelectGroup
        name="content_type"
        validate={required}
        isDisabled={codeLocked}
        options={ROLE_TYPES}
        simpleValue
        label={translate('Type')}
        required
      />
      <FormGroup label={translate('Permissions')} required>
        <Field
          component={PermissionField}
          name="permissions"
          validate={required}
        />
      </FormGroup>
    </>
  );
};

export const RoleFormDialog: FC<RoleFormDialogProps> = (props) => {
  const row = props.resolve.row;
  const isEdit = Boolean(row);
  const { closeDialog } = useModal();
  const { showErrorResponse } = useNotify();
  const queryClient = useQueryClient();

  // The roles list response is trimmed and no longer carries `permissions`,
  // which this form edits. Fetch the full role on open when editing.
  // skipGlobalErrorRedirect: a failure here must surface inside the dialog,
  // not navigate the whole app away (e.g. a stale row whose role was deleted).
  const {
    data: role,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['role-details', row?.uuid],
    queryFn: () =>
      rolesRetrieve({ path: { uuid: row.uuid } }).then(
        (response) => response.data,
      ),
    enabled: isEdit,
    meta: { skipGlobalErrorRedirect: true },
  });

  const onSubmit = useCallback(
    async (formData: RoleModifyRequest) => {
      try {
        if (isEdit) {
          await rolesUpdate({ path: { uuid: row.uuid }, body: formData });
        } else {
          await rolesCreate({ body: formData });
        }
        ENV.roles = await getRoles();
        if (isEdit) {
          queryClient.invalidateQueries({
            queryKey: ['role-details', row.uuid],
          });
        }
        closeDialog();
        props.resolve.refetch();
      } catch (e) {
        showErrorResponse(e, translate('Unable to save role.'));
        if (e.response && e.response.status === 400) {
          return {
            ...e.response.data,
            [FORM_ERROR]:
              e.response.data?.non_field_errors?.[0] || e.response.data?.detail,
          };
        }
        return { [FORM_ERROR]: translate('Unable to save role.') };
      }
    },
    [isEdit, row, queryClient, closeDialog, showErrorResponse, props.resolve],
  );

  if (isEdit && isLoading) {
    return (
      <ModalDialog title={translate('Edit role')}>
        <LoadingSpinner />
      </ModalDialog>
    );
  }

  // Never render a submittable form over a role we failed to load — otherwise
  // the edit degrades into a blank "New role" that still submits as an update.
  if (isEdit && isError) {
    return (
      <ModalDialog title={translate('Edit role')}>
        <LoadingErred
          loadData={refetch}
          message={translate('Unable to load role.')}
        />
      </ModalDialog>
    );
  }

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={role}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={role ? translate('Edit role') : translate('New role')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Save')}
                />
              </>
            }
          >
            <RoleForm role={role} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
