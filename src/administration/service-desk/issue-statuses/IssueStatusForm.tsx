import { FC, useCallback, useMemo } from 'react';
import { Field, Form as FinalForm } from 'react-final-form';
import {
  IssueStatusCreateRequest,
  IssueStatusType,
  PatchedIssueStatusRequest,
  supportIssueStatusesCreate,
  supportIssueStatusesPartialUpdate,
} from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { SelectField, StringField, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

import { IssueStatusAdmin, IssueStatusTypeChoices } from './api';

interface IssueStatusFormProps {
  resolve: {
    issueStatus?: IssueStatusAdmin;
    refetch: () => void;
  };
}

export const IssueStatusForm: FC<IssueStatusFormProps> = ({ resolve }) => {
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const isEdit = Boolean(resolve.issueStatus?.uuid);

  const submitForm = useCallback(
    async (values: { name: string; type: { value: number } }) => {
      try {
        const payload = {
          name: values.name,
          type: values.type.value,
        };
        if (isEdit) {
          await supportIssueStatusesPartialUpdate({
            path: { uuid: resolve.issueStatus!.uuid },
            body: {
              ...payload,
              type: payload.type as IssueStatusType,
            } as PatchedIssueStatusRequest,
          });
          showSuccess(translate('Issue status has been updated.'));
        } else {
          await supportIssueStatusesCreate({
            body: {
              ...payload,
              type: payload.type as IssueStatusType,
            } as IssueStatusCreateRequest,
          });
          showSuccess(translate('Issue status has been created.'));
        }
        resolve.refetch();
        closeDialog();
      } catch (error) {
        showErrorResponse(
          error,
          isEdit
            ? translate('Unable to update issue status.')
            : translate('Unable to create issue status.'),
        );
      }
    },
    [resolve, isEdit, showSuccess, showErrorResponse, closeDialog],
  );

  const initialValues = useMemo(() => {
    if (isEdit && resolve.issueStatus) {
      return {
        name: resolve.issueStatus.name || '',
        type:
          IssueStatusTypeChoices.find(
            (c) => c.value === resolve.issueStatus.type,
          ) || IssueStatusTypeChoices[0],
      };
    }
    return {
      name: '',
      type: IssueStatusTypeChoices[0],
    };
  }, [isEdit, resolve.issueStatus]);

  return (
    <FinalForm onSubmit={submitForm} initialValues={initialValues}>
      {({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit issue status')
                : translate('Create issue status')
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
            <FormGroup label={translate('Status name')} required>
              <Field
                component={StringField as any}
                name="name"
                validate={required}
                placeholder={translate('e.g., Done, Completed, Cancelled')}
              />
              <small className="text-muted">
                {translate(
                  'The exact status name as it appears in your service desk (Jira, SMAX, Zammad).',
                )}
              </small>
            </FormGroup>

            <FormGroup label={translate('Outcome type')} required>
              <Field
                component={SelectField}
                name="type"
                options={IssueStatusTypeChoices}
                validate={required}
                isClearable={false}
                getOptionLabel={(option) => option.label}
              />
              <small className="text-muted">
                {translate(
                  'Resolved: Issue was successfully completed. Canceled: Issue was rejected or canceled.',
                )}
              </small>
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    </FinalForm>
  );
};
