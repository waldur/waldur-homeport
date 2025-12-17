import Papa from 'papaparse';
import { FC, useEffect, useMemo } from 'react';
import { Field } from 'redux-form';

import { formatFilesize } from '@waldur/core/utils';
import { required } from '@waldur/core/validators';
import { FieldError } from '@waldur/form';
import { AttachmentItem } from '@waldur/form/upload/AttachmentItem';
import { UploadContainer } from '@waldur/form/upload/UploadContainer';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';
import { DownloadTemplateItem } from '@waldur/project/import/DownloadTemplateItem';
import saveAsCsv from '@waldur/table/exporters/csv';

import templateFile from './offering_users_template.json';

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
          // Check headers
          if (templateFile.fields.every((field) => header.includes(field))) {
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

          // Check offerings
          if (!_error) {
            const offeringIdx = header.indexOf('offering_uuid');
            if (!results.data.slice(1).every((record) => record[offeringIdx])) {
              _error = 'offering';
            }
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
        } else if (_error === 'offering') {
          reject({
            file: translate(
              'The offering UUID is not specified in one or more records.',
            ),
          });
        } else {
          // No error
          resolve('');
        }
      },
    });
  });

const getTemplateName = () => 'User file template';

const onDownloadClick = () => saveAsCsv(getTemplateName(), templateFile);

export const Step1UploadFile: FC<WizardFormStepProps> = (props) => {
  const fileSize = useMemo(() => {
    const csv = Papa.unparse(templateFile);
    const blob = new Blob([csv], { type: 'text/plain;charset=utf-8' });

    return formatFilesize(blob.size, 'B');
  }, []);

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
            <h6 className="fw-bold mb-5">
              1. {translate('Download template')}
            </h6>
            <DownloadTemplateItem
              name={getTemplateName()}
              size={fileSize}
              onClick={onDownloadClick}
            />
            <hr />
            <h6 className="fw-bold mb-5">2. {translate('Upload your file')}</h6>
            <Field
              name="file"
              validate={required}
              component={({ input: { value, onChange }, meta }) => (
                <>
                  <UploadContainer
                    onDrop={onChange}
                    message="CSV (max. 10 MB)"
                    accept={{
                      'application/csv': ['.csv'],
                      'text/csv': ['.csv'],
                    }}
                    multiple={false}
                    className="mb-3"
                    maxSize={10 * 1024 * 1024}
                  />

                  <ul className="mb-5">
                    <li>
                      {translate('Required columns')}: Waldur username,
                      offering, offering username
                    </li>
                    <li>{translate('Maximum rows')}: 1000</li>
                  </ul>

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
              )}
            />
          </div>
        );
      }}
    </WizardForm>
  );
};
