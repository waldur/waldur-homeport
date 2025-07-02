import Papa from 'papaparse';
import { FC, useEffect } from 'react';
import { Field } from 'redux-form';

import { ENV } from '@waldur/core/config';
import { required } from '@waldur/core/validators';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { FieldError } from '@waldur/form';
import { AttachmentItem } from '@waldur/form/upload/AttachmentItem';
import { UploadContainer } from '@waldur/form/upload/UploadContainer';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';

import { generateTemplateData } from './utils';

const asyncValidate = (values) =>
  new Promise((resolve, reject) => {
    if (!values.file?.length)
      reject({ file: translate('Please import a file.') });

    const file = values.file[0];

    if (file.type !== 'text/csv')
      reject({ file: translate('Invalid format, please import a .csv file') });

    const template = generateTemplateData(
      values.customer_uuid,
      values.offering,
    );

    Papa.parse(file, {
      skipEmptyLines: true,
      complete: function (results: { data: Array<Array<string>> }) {
        let _error = 'invalid';
        if (Array.isArray(results?.data) && Array.isArray(results?.data[0])) {
          const header = results.data[0];
          // Check headers
          if (template.fields.every((field) => header.includes(field))) {
            _error = '';
          }

          // Check empty
          if (
            !_error &&
            (!results.data[1] ||
              results.data[1]?.length === 0 ||
              (values.import_type === 'projects_with_resources' &&
                !results.data.some((record) => record[0] === 'project')))
          ) {
            _error = 'empty';
          }

          // Check organizations
          if (!_error && !values.customer_uuid) {
            const customerIdx = header.indexOf('customer_uuid');
            if (!results.data.slice(1).every((record) => record[customerIdx])) {
              _error = 'customer';
            }
          }

          // Check OECD field
          if (!_error && isFeatureVisible(ProjectFeatures.oecd_fos_2007_code)) {
            const isOecdRequired =
              ENV.plugins.WALDUR_CORE.OECD_FOS_2007_CODE_MANDATORY;
            const oecdIdx = header.indexOf('oecd_fos_2007_code');

            if (isOecdRequired && oecdIdx === -1) {
              _error = 'oecd';
            }

            let projects;
            if (values.import_type === 'projects_only') {
              projects = results.data.slice(1);
            } else {
              const typeIdx = header.indexOf('type');
              projects = results.data
                .slice(1)
                .filter((record) => record[typeIdx] === 'project');
            }

            if (isOecdRequired && projects.some((record) => !record[oecdIdx])) {
              _error = 'oecd';
            }

            if (
              !_error &&
              projects.some(
                (record) =>
                  record[oecdIdx] && Number.isNaN(Number(record[oecdIdx])),
              )
            ) {
              _error = 'invalid_oecd';
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
        } else if (_error === 'customer') {
          reject({
            file: translate(
              'The organization UUID is not specified in one or more records.',
            ),
          });
        } else if (_error === 'oecd') {
          reject({ file: translate('OECD code is required for projects.') });
        } else if (_error === 'invalid_oecd') {
          reject({ file: translate('OECD code must be a number.') });
        } else {
          // No error
          resolve('');
        }
      },
    });
  });

export const Step4UploadFile: FC<WizardFormStepProps> = (props) => {
  return (
    <WizardForm
      {...props}
      asyncValidate={asyncValidate}
      asyncChangeFields={['file']}
    >
      {(wizardProps) => {
        const importType = wizardProps.formValues?.import_type;
        const file = wizardProps.formValues?.file;

        useEffect(() => {
          if (file) {
            wizardProps.asyncValidate();
          }
        }, [file]);

        return (
          <div className="text-muted">
            <p className="mb-6">
              {importType === 'projects_only'
                ? translate('Upload your completed project template file')
                : translate(
                    'Upload your completed project and resources template file',
                  )}
            </p>
            <Field
              name="file"
              validate={required}
              component={({ input: { value, onChange }, meta }) => (
                <>
                  <UploadContainer
                    onDrop={onChange}
                    message="(CSV)"
                    accept={{
                      'application/csv': ['.csv'],
                      'text/csv': ['.csv'],
                    }}
                    multiple={false}
                    className="mb-6"
                  />

                  {value?.length > 0 && (
                    <AttachmentItem
                      attachment={{
                        file: value[0],
                        file_name: value[0].name,
                        file_size: value[0].size,
                        mime_type: value[0].type,
                      }}
                      iconSize={20}
                      onDelete={() => onChange([])}
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
