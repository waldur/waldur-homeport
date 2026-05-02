import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import { Form as FinalForm, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  supportTemplatesCreate,
  supportTemplatesCreateAttachments,
  supportTemplatesDeleteAttachments,
  supportTemplatesRetrieve,
  supportTemplatesUpdate,
} from 'waldur-js-client';

import { IssueTemplateTypeOptions } from '@/administration/utils';
import { formDataOptions } from '@/core/api';
import { ACCEPTED_FILE_TYPES } from '@/core/constants';
import { required } from '@/core/validators';
import { SelectField, StringField, SubmitButton, TextField } from '@/form';
import { AttachmentItem } from '@/form/upload/AttachmentItem';
import { AttachmentItemPending } from '@/form/upload/AttachmentItemPending';
import { AttachmentsList } from '@/form/upload/AttachmentsList';
import { Attachment, AttachmentUploading } from '@/form/upload/types';
import { UploadContainer } from '@/form/upload/UploadContainer';
import { formatJsxTemplate, translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';

interface IssueTemplateFormProps {
  resolve: { issueTemplate?; refetch };
}

export const IssueTemplateForm: FC<IssueTemplateFormProps> = ({ resolve }) => {
  const dispatch = useDispatch();
  const { openDialog, closeDialog, confirm } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const isEdit = Boolean(resolve.issueTemplate?.uuid);

  const [pendingFiles, setPendingFiles] = useState<AttachmentUploading[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    if (isEdit && resolve.issueTemplate?.attachments) {
      const formattedAttachments = resolve.issueTemplate.attachments.map(
        (attachment) => ({
          file: attachment.file,
          file_size: attachment.file_size || 0,
          file_name: attachment.file_name || attachment.name,
          mime_type: attachment.mime_type || 'application/octet-stream',
          created: attachment.created || new Date().toISOString(),
          uuid: attachment.uuid,
        }),
      );

      setAttachments(formattedAttachments);
    }
  }, [isEdit, resolve.issueTemplate]);

  const onDrop = (files: File[]) => {
    setPendingFiles((prev) =>
      files
        .map<AttachmentUploading>((f) => ({
          key: f.size,
          file: f,
          name: f.name,
          progress: null,
          error: null,
        }))
        .concat(prev),
    );
  };

  const cancelFile = useCallback(
    (file: File) => {
      setPendingFiles((prev) => prev.filter((f) => f.key !== file.size));
    },
    [setPendingFiles],
  );

  const removeAttachment = useCallback(
    async (attachment: Attachment) => {
      if (!attachment.uuid) {
        cancelFile(attachment.file as File);
        return;
      }

      try {
        await confirm(
          translate('Confirmation'),
          translate(
            'Are you sure you want to remove {doc_name}?',
            { doc_name: <strong>{attachment.file_name}</strong> },
            formatJsxTemplate,
          ),
          { forDeletion: true },
        );
      } catch {
        return;
      }

      try {
        await supportTemplatesDeleteAttachments({
          path: { uuid: resolve.issueTemplate.uuid },
          body: { attachment_ids: [attachment.uuid] },
        });
        showSuccess(translate('Document has been removed.'));
        resolve.refetch();
        setAttachments((prev) =>
          prev.filter((a) => a.uuid !== attachment.uuid),
        );
        const response = await supportTemplatesRetrieve({
          path: { uuid: resolve.issueTemplate.uuid },
        });
        openDialog(IssueTemplateForm, {
          dialogClassName: 'modal-dialog-centered',
          resolve: { issueTemplate: response.data, refetch: resolve.refetch },
          size: 'lg',
        });
      } catch (e) {
        showErrorResponse(e, translate('Unable to remove document.'));
      }
    },
    [resolve, cancelFile, showSuccess, showErrorResponse, dispatch, openDialog],
  );

  const attachFiles = async (templateUuid) => {
    if (!pendingFiles.length) return;

    try {
      await Promise.all(
        pendingFiles.map(async (file) => {
          await supportTemplatesCreateAttachments({
            path: { uuid: templateUuid },
            body: {
              attachments: [file.file],
            },
            ...formDataOptions,
          });

          setPendingFiles((prev) => prev.filter((f) => f.key !== file.key));
          setAttachments((prev) => [
            ...prev,
            {
              file: file.file,
              file_size: file.file.size,
              file_name: file.file.name,
              mime_type: file.file.type,
              created: new Date().toISOString(),
            },
          ]);
        }),
      );
      showSuccess(translate('Documents have been attached.'));
    } catch (error) {
      showErrorResponse(
        error,
        translate(
          'An error occurred while attaching documents. Please try again.',
        ),
      );
      throw error;
    }
  };

  const submitForm = useCallback(
    async (values) => {
      try {
        const action = isEdit
          ? supportTemplatesUpdate({
              body: values,
              path: { uuid: resolve.issueTemplate.uuid },
            })
          : supportTemplatesCreate({ body: values });

        const response = await action;
        const templateUuid = response.data.uuid;

        await attachFiles(templateUuid);
        resolve.refetch();
        showSuccess(
          isEdit
            ? translate('The issue template has been updated.')
            : translate('New issue template has been created.'),
        );
        closeDialog();
      } catch (error) {
        showErrorResponse(
          error,
          isEdit
            ? translate('Unable to update issue template.')
            : translate('Unable to create issue template.'),
        );
      }
    },
    [resolve, attachFiles, isEdit, showSuccess, showErrorResponse, closeDialog],
  );

  const initialValues = useMemo(() => {
    if (isEdit && resolve.issueTemplate) {
      return {
        name: resolve.issueTemplate.name || '',
        issue_type: resolve.issueTemplate.issue_type || '',
        description: resolve.issueTemplate.description || '',
      };
    }
    return {
      name: '',
      issue_type: '',
      description: '',
    };
  }, [isEdit, resolve.issueTemplate]);

  return (
    <FinalForm onSubmit={submitForm} initialValues={initialValues}>
      {({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit the issue template')
                : translate('Create new issue template')
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
            <FormGroup label={translate('Name')} required>
              <Field
                component={StringField as any}
                name="name"
                validate={required}
              />
            </FormGroup>

            <FormGroup label={translate('Type')} required>
              <Field
                component={SelectField as any}
                name="issue_type"
                options={IssueTemplateTypeOptions}
                validate={required}
                getOptionValue={(option) => option.value}
                getOptionLabel={(option) => option.label}
                simpleValue
              />
            </FormGroup>

            <FormGroup label={translate('Description')} required>
              <Field
                component={TextField as any}
                name="description"
                validate={required}
              />
            </FormGroup>

            <Form.Label>{translate('Attachments')}</Form.Label>
            <UploadContainer
              onDrop={onDrop}
              message={translate(
                'PDF, PNG, JPG, JPEG, DOCX, DOC or ODT (max. 2 MB)',
              )}
              maxSize={2 * 1024 * 1024} // 2MB
              accept={ACCEPTED_FILE_TYPES}
            />

            <AttachmentsList
              attachments={attachments}
              uploading={pendingFiles}
              className="mb-7"
              ItemComponent={(itemProps) => (
                <AttachmentItem onDelete={removeAttachment} {...itemProps} />
              )}
              ItemPendingComponent={(itemProps) => (
                <AttachmentItemPending {...itemProps} onCancel={cancelFile} />
              )}
            />
          </ModalDialog>
        </form>
      )}
    </FinalForm>
  );
};
