import { FieldError } from '@waldur/form';
import { AttachmentItem } from '@waldur/form/upload/AttachmentItem';
import { UploadContainer } from '@waldur/form/upload/UploadContainer';
import { translate } from '@waldur/i18n';

export const TemplateUploaderField = ({
  input: { value, onChange },
  meta,
  description = null,
}) => {
  return (
    <>
      <UploadContainer
        onDrop={onChange}
        message={translate('CSV (max. 10 MB)')}
        accept={{
          'application/csv': ['.csv'],
          'text/csv': ['.csv'],
        }}
        multiple={false}
        className={description ? 'mb-3' : 'mb-6'}
        maxSize={10 * 1024 * 1024}
      />

      {description}

      {value?.length > 0 && (
        <AttachmentItem
          attachment={{
            file: value[0],
            file_name: value[0].name,
            file_size: value[0].size,
            mime_type: value[0].type,
          }}
          onDelete={() => onChange([])}
          error={meta.error}
        />
      )}
      <FieldError error={meta.dirty && meta.error} />
    </>
  );
};
