import { Field, useFormState } from 'react-final-form';

import { FormField, FormLabel } from 'waldur-ui';

import { AttachmentItemPending } from '@/form/upload/AttachmentItemPending';
import { AttachmentsList } from '@/form/upload/AttachmentsList';
import { UploadContainer } from '@/form/upload/UploadContainer';
import { translate } from '@/i18n';

export const AttachmentsGroup = () => {
  const { submitting } = useFormState({ subscription: { submitting: true } });

  return (
    <FormField className="mb-5">
      <FormLabel>{translate('Attachments')}</FormLabel>
      <Field
        name="files"
        component={({ input: { value, onChange } }) => {
          const filesList = value || [];
          return (
            <>
              <UploadContainer
                // Append newly dropped files to the existing selection instead
                // of replacing it; skip duplicates by name + size.
                onDrop={(acceptedFiles) => {
                  const existing = Array.from(filesList as FileList);
                  const added = acceptedFiles.filter(
                    (file) =>
                      !existing.some(
                        (e) => e.name === file.name && e.size === file.size,
                      ),
                  );
                  onChange([...existing, ...added]);
                }}
                disabled={submitting}
                message={translate('SVG, PNG, JPG or GIF (max. 800x400px)')}
              />

              {filesList.length > 0 ? (
                <AttachmentsList
                  uploading={Array.from(filesList as FileList).map((file) => ({
                    key: file.size,
                    file,
                  }))}
                  className="p-0 pt-4"
                  ItemPendingComponent={(itemProps) => (
                    <AttachmentItemPending
                      {...itemProps}
                      onCancel={(f) =>
                        onChange(
                          Array.from(filesList as FileList).filter(
                            (file) =>
                              file.name !== f.name && file.size !== f.size,
                          ),
                        )
                      }
                    />
                  )}
                />
              ) : null}
            </>
          );
        }}
      />
    </FormField>
  );
};
