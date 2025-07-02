import { Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Field, isSubmitting } from 'redux-form';

import { AttachmentItemPending } from '@waldur/form/upload/AttachmentItemPending';
import { AttachmentsList } from '@waldur/form/upload/AttachmentsList';
import { UploadContainer } from '@waldur/form/upload/UploadContainer';
import { translate } from '@waldur/i18n';

import { ISSUE_CREATION_FORM_ID } from './constants';

export const AttachmentsGroup = () => {
  const submitting = useSelector(isSubmitting(ISSUE_CREATION_FORM_ID));

  return (
    <Form.Group className="mb-5">
      <Form.Label>{translate('Attachments')}</Form.Label>
      <Field
        name="files"
        component={({ input: { value, onChange } }) => (
          <>
            <UploadContainer
              onDrop={onChange}
              disabled={submitting}
              message={translate('SVG, PNG, JPG or GIF (max. 800x400px)')}
            />

            {value.length > 0 ? (
              <AttachmentsList
                uploading={Array.from(value as FileList).map((file) => ({
                  key: file.size,
                  file,
                }))}
                className="p-0 pt-4"
                ItemPendingComponent={(itemProps) => (
                  <AttachmentItemPending
                    {...itemProps}
                    onCancel={(f) =>
                      onChange(
                        Array.from(value as FileList).filter(
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
        )}
      />
    </Form.Group>
  );
};
