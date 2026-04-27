import Papa from 'papaparse';
import { FC, useEffect } from 'react';
import { Field } from 'redux-form';

import { required } from '@/core/validators';
import { WizardForm, WizardFormStepProps } from '@/form/WizardForm';
import { translate } from '@/i18n';
import { TemplateUploaderField } from '@/project/import/TemplateUploaderField';

const MAX_LENGTH = 1000;

const asyncValidate = (values) =>
  new Promise((resolve, reject) => {
    if (!values.file?.length)
      reject({ file: translate('Please import a file.') });

    const file = values.file[0];

    if (file.type !== 'text/csv')
      reject({ file: translate('Invalid format, please import a .csv file') });

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
          reject({
            file: translate(
              'The imported data format does not match the template format.',
            ),
          });
        } else if (_error === 'empty') {
          reject({ file: translate('The imported file is empty.') });
        } else if (_error === 'max') {
          reject({
            file: translate('The number of records exceeds the allowed limit.'),
          });
        } else {
          // No error
          resolve('');
        }
      },
    });
  });

export const Step2UploadFile: FC<WizardFormStepProps> = (props) => {
  return (
    <WizardForm
      {...props}
      asyncValidate={asyncValidate}
      asyncChangeFields={['file']}
    >
      {(wizardProps) => {
        const file = wizardProps.formValues?.file;

        useEffect(() => {
          if (file) {
            wizardProps.asyncValidate();
          }
        }, [file]);

        return (
          <div className="text-muted">
            <p className="mb-6">
              {translate('Upload your completed organization template file')}
            </p>
            <Field
              name="file"
              validate={required}
              component={TemplateUploaderField}
            />
          </div>
        );
      }}
    </WizardForm>
  );
};
