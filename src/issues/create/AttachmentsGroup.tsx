import { Form } from 'react-bootstrap';
import { Field, useFormState } from 'react-final-form';

import { AttachmentItemPending } from '@/form/upload/AttachmentItemPending';
import { AttachmentsList } from '@/form/upload/AttachmentsList';
import { UploadContainer } from '@/form/upload/UploadContainer';
import { translate } from '@/i18n';

export const AttachmentsGroup = () => {
  const { submitting } = useFormState();

  return (
    <Form.Group className="mb-5">
      <Form.Label>{translate('Attachments')}</Form.Label>
      <Field
        name="files"
        component={({ input: { value, onChange } }) => {
          const filesList = value || [];
          return (
            <>
              <UploadContainer
                onDrop={onChange}
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
    </Form.Group>
  );
};
