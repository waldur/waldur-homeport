import { ACCEPTED_FILE_TYPES } from '@waldur/core/constants';
import { UploadContainer } from '@waldur/form/upload/UploadContainer';
import { translate } from '@waldur/i18n';

import { DocumentationFiles } from './DocumentationFiles';

export const UploadDocumentationFiles = (props) => (
  <>
    <UploadContainer
      onDrop={(files) => props.input.onChange(files)}
      message={
        'PDF, PNG/JPG/JPEG, DOC/DOCX/ODT (' +
        translate('max. {size}', { size: '25 MB' }) +
        ')'
      }
      multiple={true}
      maxSize={25 * 1024 * 1024} // 25MB
      accept={ACCEPTED_FILE_TYPES}
    />

    <DocumentationFiles
      files={props.proposal.supporting_documentation}
      pending={props.input.value}
      onChange={props.input.onChange}
    />
  </>
);
