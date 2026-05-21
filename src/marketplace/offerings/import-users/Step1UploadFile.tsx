import Papa from 'papaparse';
import { FC, useMemo } from 'react';
import { Field } from 'react-final-form';

import { formatFilesize } from '@/core/utils';
import { required } from '@/core/validators';
import { FieldError } from '@/form';
import { AttachmentItem } from '@/form/upload/AttachmentItem';
import { UploadContainer } from '@/form/upload/UploadContainer';
import { translate } from '@/i18n';
import { DownloadTemplateItem } from '@/project/import/DownloadTemplateItem';
import saveAsCsv from '@/table/exporters/csv';
import { WizardForm, WizardFormStepProps } from '@/wizard';

import templateFile from './offering_users_template.json';

const MAX_LENGTH = 1000;

const validateFile = (valueList) => {
  if (!valueList?.length) {
    return translate('Please import a file.');
  }

  const file = valueList[0];

  if (file.type !== 'text/csv') {
    return translate('Invalid format, please import a .csv file');
  }

  return new Promise<string | undefined>((resolve) => {
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
        } else if (_error === 'offering') {
          resolve(
            translate(
              'The offering UUID is not specified in one or more records.',
            ),
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

const getTemplateName = () => 'User file template';

const onDownloadClick = () => saveAsCsv(getTemplateName(), templateFile);

export const Step1UploadFile: FC<WizardFormStepProps> = (props) => {
  const fileSize = useMemo(() => {
    const csv = Papa.unparse(templateFile);
    const blob = new Blob([csv], { type: 'text/plain;charset=utf-8' });

    return formatFilesize(blob.size, 'B');
  }, []);

  return (
    <WizardForm {...props}>
      <div className="text-muted">
        <h6 className="fw-bold mb-5">1. {translate('Download template')}</h6>
        <DownloadTemplateItem
          name={getTemplateName()}
          size={fileSize}
          onClick={onDownloadClick}
        />
        <hr />
        <h6 className="fw-bold mb-5">2. {translate('Upload your file')}</h6>
        <Field
          name="file"
          validate={validateFileField}
          render={({ input: { value, onChange }, meta }) => (
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
                  {translate('Required columns')}: Waldur username, offering,
                  offering username
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
              <FieldError error={(meta.touched || meta.dirty) && meta.error} />
            </>
          )}
        />
      </div>
    </WizardForm>
  );
};
