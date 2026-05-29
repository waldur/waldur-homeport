import { FC } from 'react';
import { Field } from 'react-final-form';

import { NumberField } from '@/form';
import { CommaSeparatedListField } from '@/form/CommaSeparatedListField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

// File constraints are validated by the backend (extension format, positive
// limits, MIME format), so this form only collects the values.
export const QuestionFileFields: FC<{ multiple?: boolean }> = ({
  multiple,
}) => (
  <>
    <FormGroup
      label={translate('Allowed file extensions')}
      space={5}
      help={translate(
        'Comma-separated list of extensions (e.g. .pdf, .docx). Leave empty to allow all.',
      )}
    >
      <Field
        name="allowed_file_types"
        component={CommaSeparatedListField}
        placeholder=".pdf, .docx, .png"
      />
    </FormGroup>

    <FormGroup
      label={translate('Allowed MIME types')}
      space={5}
      help={translate(
        'Comma-separated list of MIME types (e.g. application/pdf, image/*). Leave empty to skip MIME validation.',
      )}
    >
      <Field
        name="allowed_mime_types"
        component={CommaSeparatedListField}
        placeholder="application/pdf, image/*"
      />
    </FormGroup>

    <FormGroup
      label={translate('Maximum file size (MB)')}
      space={5}
      help={translate('Leave empty for no size limit.')}
    >
      <Field name="max_file_size_mb" component={NumberField} placeholder="10" />
    </FormGroup>

    {multiple && (
      <FormGroup
        label={translate('Maximum number of files')}
        space={5}
        help={translate('Leave empty for no limit.')}
      >
        <Field name="max_files_count" component={NumberField} placeholder="5" />
      </FormGroup>
    )}
  </>
);
