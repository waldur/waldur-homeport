import { FC, useCallback, useState } from 'react';
import { Form } from 'react-final-form';
import { marketplaceOfferingFilesCreate, Offering } from 'waldur-js-client';

import { formDataOptions } from '@/core/api';
import { ACCEPTED_FILE_TYPES } from '@/core/constants';
import { format } from '@/core/ErrorMessageFormatter';
import { SubmitButton, StringGroup } from '@/form';
import { AttachmentItem } from '@/form/upload/AttachmentItem';
import { AttachmentItemPending } from '@/form/upload/AttachmentItemPending';
import { AttachmentsList } from '@/form/upload/AttachmentsList';
import { Attachment, AttachmentUploading } from '@/form/upload/types';
import { UploadContainer } from '@/form/upload/UploadContainer';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';

interface AddDocumentProps {
  resolve: { refetch(): void; offering: Offering };
}

// Files of equal size are a realistic collision, so key on name + size +
// last-modified timestamp rather than size alone.
const getFileKey = (file: File) =>
  `${file.name}-${file.size}-${file.lastModified}`;

export const AddDocumentDialog: FC<AddDocumentProps> = ({
  resolve: { offering, refetch },
}) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [pendingFiles, setPendingFiles] = useState<AttachmentUploading[]>([]);

  const onDrop = (files: File[]) => {
    setPendingFiles((prev) =>
      files
        .map<AttachmentUploading>((f) => ({
          key: getFileKey(f),
          file: f,
          progress: null,
          error: null,
        }))
        .concat(prev),
    );
  };

  const callback = useCallback(
    async (formData: Record<string, any>) => {
      setPendingFiles((prev) =>
        prev.map((f) => {
          f.progress = 0;
          f.error = null;
          return f;
        }),
      );
      const names = pendingFiles.map(
        (pending, index) => formData[`name-${index}`] || pending.file.name,
      );
      if (pendingFiles.length) {
        await Promise.allSettled(
          pendingFiles.map((pending, index) =>
            marketplaceOfferingFilesCreate({
              body: {
                offering: offering.url,
                name: names[index],
                file: pending.file,
              },
              ...formDataOptions,
            })
              .then(() => {
                setPendingFiles((prev) =>
                  prev.filter((f) => f.key !== pending.key),
                );
                setAttachments((prev) => [
                  ...prev,
                  {
                    file: pending.file,
                    file_size: pending.file.size,
                    file_name: pending.file.name,
                    mime_type: pending.file.type,
                    created: new Date().toISOString(),
                  },
                ]);
              })
              .catch((error) => {
                setPendingFiles((prev) => {
                  const item = prev.find((f) => f.key === pending.key);
                  const rest = prev.filter((f) => f.key !== pending.key);
                  return [
                    ...rest,
                    { ...item, error: format(error), progress: null },
                  ];
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
                'An error occurred while uploading documents. Please try again.',
              ),
            );
            throw rejected.reason;
          } else {
            // Success
            refetch();
            showSuccess(translate('Documents have been uploaded.'));
            closeDialog();
          }
        });
      }
    },
    [
      pendingFiles,
      setPendingFiles,
      setAttachments,
      offering.url,
      refetch,
      showSuccess,
      showErrorResponse,
      closeDialog,
    ],
  );

  const cancelFile = useCallback(
    (file: File) => {
      const key = getFileKey(file);
      setPendingFiles((prev) => prev.filter((f) => f.key !== key));
    },
    [setPendingFiles],
  );

  return (
    <Form
      onSubmit={callback}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Add documents')}
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
            <div className="size-sm">
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
                    onRetry={() => handleSubmit()}
                  />
                )}
              />

              {pendingFiles.map((file, index) => (
                <StringGroup
                  key={index}
                  name={`name-${index}`}
                  label={translate('Name for {file}', {
                    file: file.file.name,
                  })}
                  placeholder={file.file.name}
                  required={false}
                  disabled={submitting}
                />
              ))}
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
