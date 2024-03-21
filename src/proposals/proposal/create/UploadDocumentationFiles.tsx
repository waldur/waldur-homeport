import { DropzoneFiles } from '@waldur/core/DropzoneFiles';
import { formatJsx, translate } from '@waldur/i18n';

export const UploadDocumentationFiles = (props) => (
  <>
    {props.input.value?.length && (
      <ul className="text-muted">
        {props.input.value.map((item, index) => (
          <li key={index}>
            <a href={item.file} target="_blank" rel="noreferrer">
              {translate('File {index}', { index })}
            </a>
          </li>
        ))}
      </ul>
    )}
    <DropzoneFiles
      multiple={false}
      maxSize={25 * 1024 * 1024} // 25MB
      accept={{
        'application/pdf': ['.pdf'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          ['.docx'],
        'application/msword': ['.doc'],
        'application/vnd.oasis.opendocument.text': ['.odt'],
      }}
      onDrop={(files) => props.input.onChange(files?.length ? files[0] : null)}
      message={translate(
        'Drag and drop file here or <u>Choose file</u>',
        {
          u: (s) => <u className="text-link">{s}</u>,
        },
        formatJsx,
      )}
      footerLeft={
        translate('Supported formats') + ': PDF, PNG/JPG/JPEG, DOC/DOCX/ODT'
      }
      footerRight={translate('Maximum size') + ': 25MB'}
    />
  </>
);
