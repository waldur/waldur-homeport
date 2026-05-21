import Papa from 'papaparse';
import { FC } from 'react';
import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import { translate } from '@/i18n';
import { TemplateUploaderField } from '@/project/import/TemplateUploaderField';
import { WizardForm, WizardFormStepProps } from '@/wizard';

const MAX_LENGTH = 1000;

const validateFile = (valueList) => {
  if (!valueList?.length) {
    return translate('Please import a file.');
  }

  const file = valueList[0];

  if (file.type !== 'text/csv') {
    return translate('Invalid format, please import a .csv file');
  }

  return new Promise((resolve) => {
    Papa.parse(file, {
      skipEmptyLines: true,
      complete: function (results: { data: Array<Array<string>> }) {
        let _error = 'invalid';
        if (Array.isArray(results?.data) && Array.isArray(results?.data[0])) {
          const header = results.data[0];
          // Check headers (required fields)
          if (header.includes('name') && header.includes('email')) {
            _error = '';
          }

          // Check empty
          if (!_error && (!results.data[1] || results.data[1]?.length === 0)) {
            _error = 'empty';
          }

          // Check max length
          if (!_error && results.data?.length > MAX_LENGTH + 1) {
            _error = 'max';
          }
        }

        if (_error === 'invalid') {
          resolve(
            translate(
              'The imported data format does not match the template format.',
            ),
          );
        } else if (_error === 'empty') {
          resolve(translate('The imported file is empty.'));
        } else if (_error === 'max') {
          resolve(
            translate('The number of records exceeds the allowed limit.'),
          );
        } else {
          // No error
          resolve(undefined);
        }
      },
    });
  });
};

const validateFileField = (value) => {
  const reqErr = required(value);
  if (reqErr) return reqErr;
  return validateFile(value);
};

export const Step2UploadFile: FC<WizardFormStepProps> = (props) => (
  <WizardForm {...props}>
    <div className="text-muted">
      <p className="mb-6">
        {translate('Upload your completed organization template file')}
      </p>
      <Field
        name="file"
        validate={validateFileField}
        component={TemplateUploaderField}
      />
    </div>
  </WizardForm>
);
