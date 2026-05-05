import { FC, useMemo } from 'react';
import { Field, Form as FinalForm } from 'react-final-form';
import {
  IssueStatusCreateRequest,
  IssueStatusType,
  PatchedIssueStatusRequest,
  supportIssueStatusesCreate,
  supportIssueStatusesPartialUpdate,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { SelectField, StringField, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { IssueStatusAdmin, IssueStatusTypeChoices } from './api';

interface IssueStatusFormProps {
  resolve: {
    issueStatus?: IssueStatusAdmin;
    refetch: () => void;
  };
}

export const IssueStatusForm: FC<IssueStatusFormProps> = ({ resolve }) => {
  const isEdit = Boolean(resolve.issueStatus?.uuid);

  const saveIssueStatusMutation = useManagedMutation<
    any,
    any,
    { name: string; type: { value: number } }
  >({
    mutationFn: (values) => {
      const payload = {
        name: values.name,
        type: values.type.value,
      };
      if (isEdit) {
        return supportIssueStatusesPartialUpdate({
          path: { uuid: resolve.issueStatus!.uuid },
          body: {
            ...payload,
            type: payload.type as IssueStatusType,
          } as PatchedIssueStatusRequest,
        });
      } else {
        return supportIssueStatusesCreate({
          body: {
            ...payload,
            type: payload.type as IssueStatusType,
          } as IssueStatusCreateRequest,
        });
      }
    },
    successMessage: isEdit
      ? translate('Issue status has been updated.')
      : translate('Issue status has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update issue status.')
      : translate('Unable to create issue status.'),
    refetch: resolve.refetch,
  });

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
    <FinalForm<{ name: string; type: { value: number } }>
      onSubmit={(values) => saveIssueStatusMutation.mutateAsync(values)}
      initialValues={initialValues}
    >
      {({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit issue status')
                : translate('Create issue status')
            }
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
