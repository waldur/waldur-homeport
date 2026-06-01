import { FC } from 'react';

import { NumberGroup, CommaSeparatedListGroup } from '@/form';
import { translate } from '@/i18n';

// File constraints are validated by the backend (extension format, positive
// limits, MIME format), so this form only collects the values.
export const QuestionFileFields: FC<{ multiple?: boolean }> = ({
  multiple,
}) => (
  <>
    <CommaSeparatedListGroup
      label={translate('Allowed file extensions')}
      space={5}
      help={translate(
        'Comma-separated list of extensions (e.g. .pdf, .docx). Leave empty to allow all.',
      )}
      name="allowed_file_types"
      placeholder=".pdf, .docx, .png"
    />

    <CommaSeparatedListGroup
      label={translate('Allowed MIME types')}
      space={5}
      help={translate(
        'Comma-separated list of MIME types (e.g. application/pdf, image/*). Leave empty to skip MIME validation.',
      )}
      name="allowed_mime_types"
      placeholder="application/pdf, image/*"
    />

    <NumberGroup
      name="max_file_size_mb"
      placeholder="10"
      label={translate('Maximum file size (MB)')}
      space={5}
      help={translate('Leave empty for no size limit.')}
    />

    {multiple && (
      <NumberGroup
        name="max_files_count"
        placeholder="5"
        label={translate('Maximum number of files')}
        space={5}
        help={translate('Leave empty for no limit.')}
      />
    )}
  </>
);
