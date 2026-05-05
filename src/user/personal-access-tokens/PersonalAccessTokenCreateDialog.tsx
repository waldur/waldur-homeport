import React, { useEffect, useMemo, useState } from 'react';
import { Field, Form } from 'react-final-form';
import {
  personalAccessTokensCreate,
  personalAccessTokensAvailableScopesList,
  PersonalAccessTokenCreateRequest,
} from 'waldur-js-client';

import { PermissionOptions } from '@/administration/roles/PermissionOptions';
import { lazyComponent } from '@/core/lazyComponent';
import { required } from '@/core/validators';
import { DateField } from '@/form/DateField';
import { SelectField } from '@/form/SelectField';
import { StringField } from '@/form/StringField';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';

const PersonalAccessTokenSecretDialog = lazyComponent(() =>
  import('./PersonalAccessTokenSecretDialog').then((module) => ({
    default: module.PersonalAccessTokenSecretDialog,
  })),
);

interface PersonalAccessTokenCreateDialogProps {
  resolve: {
    refetch?: () => void;
  };
}

export const PersonalAccessTokenCreateDialog: React.FC<
  PersonalAccessTokenCreateDialogProps
> = ({ resolve: { refetch } }) => {
  const { showErrorResponse } = useNotify();
  const { openDialog, closeDialog } = useModal();

  const [availableScopes, setAvailableScopes] = useState<Set<string>>();

  useEffect(() => {
    personalAccessTokensAvailableScopesList().then((res) => {
      setAvailableScopes(new Set((res.data as any[]).map((s) => s.permission)));
    });
  }, []);

  const scopeOptions = useMemo(() => {
    if (!availableScopes) return [];
    const result: { value: string; label: string }[] = [];
    for (const group of PermissionOptions) {
      for (const opt of group.options) {
        if (availableScopes.has(opt.value)) {
          result.push({
            value: opt.value,
            label: `${group.label}: ${opt.label}`,
          });
        }
      }
    }
    return result;
  }, [availableScopes]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const processRequest = React.useCallback(
    async (values: PersonalAccessTokenCreateRequest) => {
      try {
        const response = await personalAccessTokensCreate({ body: values });
        const created = response.data;
        if (refetch) {
          await refetch();
        }
        closeDialog();
        openDialog(PersonalAccessTokenSecretDialog, {
          size: 'lg',
          resolve: { token: created.token, tokenName: created.name },
        });
      } catch (e) {
        showErrorResponse(e, translate('Unable to create token.'));
      }
    },
    [showErrorResponse, openDialog, closeDialog, refetch],
  );

  return (
    <Form
      onSubmit={processRequest}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Create personal access token')}
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={translate('Create token')}
                className="btn btn-primary"
              />
            }
          >
            <div className="size-lg">
              <FormGroup label={translate('Token name')} required>
                <Field
                  component={StringField as any}
                  name="name"
                  validate={required}
                  placeholder={translate('e.g. CI/CD pipeline token')}
                />
              </FormGroup>
              <FormGroup
                label={translate('Scopes')}
                required
                description={translate(
                  'Select the permissions this token should have. The token can only use permissions you currently hold.',
                )}
              >
                <Field
                  component={SelectField as any}
                  name="scopes"
                  validate={required}
                  isMulti
                  simpleValue
                  options={scopeOptions}
                  placeholder={translate('Select scopes...')}
                />
              </FormGroup>
              <FormGroup
                label={translate('Expiration date')}
                required
                description={translate(
                  'The token will stop working after this date.',
                )}
              >
                <Field
                  component={DateField as any}
                  name="expires_at"
                  validate={required}
                  minDate={minDate}
                  placeholder={translate('Select expiration date')}
                />
              </FormGroup>
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
