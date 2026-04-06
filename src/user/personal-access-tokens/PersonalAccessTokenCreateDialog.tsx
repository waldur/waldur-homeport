import React, { useEffect, useMemo, useState } from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  personalAccessTokensCreate,
  personalAccessTokensAvailableScopesList,
  PersonalAccessTokenCreateRequest,
} from 'waldur-js-client';

import { PermissionOptions } from '@waldur/administration/roles/PermissionOptions';
import { required } from '@waldur/core/validators';
import { DateField } from '@waldur/form/DateField';
import { SelectField } from '@waldur/form/SelectField';
import { StringField } from '@waldur/form/StringField';
import { SubmitButton } from '@waldur/form/SubmitButton';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

import { personalAccessTokenSecretDialog } from './secretActions';

interface PersonalAccessTokenCreateDialogProps {
  resolve: {
    refetch?: () => void;
  };
}

export const PersonalAccessTokenCreateDialog: React.FC<
  PersonalAccessTokenCreateDialogProps
> = ({ resolve: { refetch } }) => {
  const dispatch = useDispatch();
  const { showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

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
        dispatch(personalAccessTokenSecretDialog(created.token, created.name));
      } catch (e) {
        showErrorResponse(e, translate('Unable to create token.'));
      }
    },
    [dispatch, showErrorResponse, closeDialog, refetch],
  );

  return (
    <Form
      onSubmit={processRequest}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Create personal access token')}
            closeButton
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
