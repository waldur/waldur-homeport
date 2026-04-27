import { PencilSimpleIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { Field, Form } from 'react-final-form';
import {
  KeycloakScopeOptionRequest,
  marketplaceProviderResourcesSetKeycloakScopes,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { StringField, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { useModal } from '@/modal/hooks';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/hooks';

export type ScopeOption = KeycloakScopeOptionRequest;

interface AddScopeOptionDialogProps {
  resolve: {
    resourceUuid: string;
    existingScopes: ScopeOption[];
    /** When set, the dialog edits this scope instead of adding a new one. */
    editScope?: ScopeOption;
  };
}

export const AddScopeOptionDialog: FC<AddScopeOptionDialogProps> = ({
  resolve,
}) => {
  const { showErrorResponse } = useNotify();
  const { closeDialog } = useModal();
  const isEdit = Boolean(resolve.editScope);

  const save = useCallback(
    async (formData: ScopeOption) => {
      try {
        let newScopes: ScopeOption[];
        if (resolve.editScope) {
          newScopes = resolve.existingScopes.map((s) =>
            s.scope_id === resolve.editScope.scope_id ? formData : s,
          );
        } else {
          newScopes = [...resolve.existingScopes, formData];
        }
        await marketplaceProviderResourcesSetKeycloakScopes({
          path: { uuid: resolve.resourceUuid },
          body: { keycloak_available_scopes: newScopes },
        });
        closeDialog();
      } catch (error) {
        showErrorResponse(
          error,
          isEdit
            ? translate('Unable to update scope option.')
            : translate('Unable to add scope option.'),
        );
      }
    },
    [resolve, isEdit, showErrorResponse, closeDialog],
  );

  return (
    <Form onSubmit={save} initialValues={resolve.editScope}>
      {({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit scope option')
                : translate('Add scope option')
            }
            subtitle={translate(
              'Configure a scope that end users can select when assigning roles',
            )}
            footer={
              <>
                <CloseDialogButton className="w-175px" />
                <SubmitButton
                  label={isEdit ? translate('Save') : translate('Add')}
                  submitting={submitting}
                  disabled={invalid}
                  className="btn btn-primary w-175px"
                />
              </>
            }
            iconNode={
              isEdit ? (
                <PencilSimpleIcon weight="bold" />
              ) : (
                <PlusCircleIcon weight="bold" />
              )
            }
            iconColor={isEdit ? 'info' : 'success'}
          >
            <FormGroup label={translate('Scope type')} required>
              <Field
                name="scope_type"
                validate={required}
                component={StringField as any}
                placeholder={translate('e.g. project, cluster')}
              />
            </FormGroup>
            <FormGroup label={translate('Scope ID')} required>
              <Field
                name="scope_id"
                validate={required}
                component={StringField as any}
                placeholder={translate('UUID or external identifier')}
                disabled={isEdit}
              />
            </FormGroup>
            <FormGroup label={translate('Label')} required spaceless>
              <Field
                name="label"
                validate={required}
                component={StringField as any}
                placeholder={translate('Human-readable name for end users')}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
