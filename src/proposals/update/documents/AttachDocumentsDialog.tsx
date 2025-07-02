import { useCallback, useState } from 'react';
import { Field, reduxForm } from 'redux-form';
import { proposalProtectedCallsAttachDocuments } from 'waldur-js-client';

import { formDataOptions } from '@waldur/core/api';
import { ACCEPTED_FILE_TYPES } from '@waldur/core/constants';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { FormContainer, StringField, SubmitButton } from '@waldur/form';
import { AttachmentItem } from '@waldur/form/upload/AttachmentItem';
import { AttachmentItemPending } from '@waldur/form/upload/AttachmentItemPending';
import { AttachmentsList } from '@waldur/form/upload/AttachmentsList';
import { Attachment, AttachmentUploading } from '@waldur/form/upload/types';
import { UploadContainer } from '@waldur/form/upload/UploadContainer';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

interface AttachDocumentsFormData {
  files: { file: File }[];
  description: string;
}

interface AttachDocumentsProps {
  resolve: { refetch; call };
}

export const AttachDocumentsDialog = reduxForm<
  AttachDocumentsFormData,
  AttachDocumentsProps
>({
  form: 'AttachDocumentsDialog',
})(({ resolve: { call, refetch }, submitting, handleSubmit }) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [pendingFiles, setPendingFiles] = useState<AttachmentUploading[]>([]);

  const onDrop = (files: File[]) => {
    setPendingFiles((prev) =>
      files
        .map<AttachmentUploading>((f) => ({
          key: f.size,
          file: f,
          progress: null,
          error: null,
        }))
        .concat(prev),
    );
  };

  const callback = useCallback(
    async (formData: AttachDocumentsFormData) => {
      setPendingFiles((prev) =>
        prev.map((f) => {
          f.progress = 0;
          f.error = null;
          return f;
        }),
      );
      const descriptions = pendingFiles.map(
        (_, index) => formData[`description-${index}`] || '',
      );
      if (pendingFiles.length) {
        await Promise.allSettled(
          pendingFiles.map((pending, index) =>
            proposalProtectedCallsAttachDocuments({
              path: { uuid: call.uuid },
              body: {
                documents: pending.file as any,
                description: descriptions[index],
              },
              ...formDataOptions,
            })
              .then(() => {
                setPendingFiles((prev) =>
                  prev.filter((f) => f.key !== pending.key),
                );
                setAttachments((prev) => {
                  prev[index] = {
                    file: pending.file,
                    file_size: pending.file.size,
                    file_name: pending.file.name,
                    mime_type: pending.file.type,
                    created: new Date().toISOString(),
                  };
                  return prev;
                });
              })
              .catch((error) => {
                setPendingFiles((prev) => {
                  const item = prev.find((f) => f.key === pending.key);
                  const rest = prev.filter((f) => f.key !== pending.key);
                  item.error = format(error);
                  item.progress = null;
                  return [...rest, item];
                });
                throw error;
              }),
          ),
        ).then((res) => {
          const rejected = res.find(
            (r) => r.status === 'rejected',
          ) as PromiseRejectedResult;
          if (rejected) {
            // Error
            showErrorResponse(
              rejected.reason,
              translate(
                'An error occurred while attaching documents. Please try again.',
              ),
            );
            throw rejected.reason;
          } else {
            // Success
            refetch();
            showSuccess(translate('Documents have been attached.'));
            closeDialog();
          }
        });
      }
    },
    [pendingFiles, setPendingFiles, setAttachments],
  );

  const cancelFile = useCallback(
    (file: File) => {
      setPendingFiles((prev) => prev.filter((f) => f.key !== file.size));
    },
    [setPendingFiles],
  );

  return (
    <form onSubmit={handleSubmit(callback)}>
      <ModalDialog
        title={translate('Add call attachments')}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              submitting={submitting}
              disabled={!pendingFiles.length}
              label={translate('Save')}
            />
          </>
        }
      >
        <FormContainer submitting={submitting}>
          <UploadContainer
            onDrop={onDrop}
            disabled={submitting}
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
            ItemComponent={AttachmentItem}
            ItemPendingComponent={(itemProps) => (
              <AttachmentItemPending
                {...itemProps}
                onCancel={cancelFile}
                onRetry={handleSubmit(callback)}
              />
            )}
          />

          {pendingFiles.map((file, index) => (
            <Field
              key={index}
              name={`description-${index}`}
              component={StringField}
              label={translate('Description for {file}', {
                file: file.file.name,
              })}
              required={false}
            />
          ))}
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
