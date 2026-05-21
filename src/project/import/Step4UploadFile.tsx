import Papa from 'papaparse';
import { FC } from 'react';
import { Field, useFormState } from 'react-final-form';
import { Customer } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';

import { TemplateUploaderField } from './TemplateUploaderField';
import { ProjectImportFormData } from './types';
import { generateTemplateData } from './utils';

const validateCsvFile = (
  values: ProjectImportFormData,
  customer?: Customer,
): Promise<string | undefined> => {
  return new Promise((resolve) => {
    if (!values?.file?.length) {
      return resolve(translate('Please import a file.'));
    }

    const file = values.file[0];
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return resolve(translate('Invalid format, please import a .csv file'));
    }

    const customerUuid = customer?.uuid || values.customer_uuid;
    const template = generateTemplateData(
      customerUuid,
      values.import_type === 'projects_with_resources'
        ? values.offering || undefined
        : undefined,
    );

    Papa.parse(file, {
      skipEmptyLines: true,
      complete: function (results: { data: Array<Array<string>> }) {
        let _error = 'invalid';
        if (Array.isArray(results?.data) && Array.isArray(results?.data[0])) {
          const header = results.data[0].map((h) => h.split('(')[0].trim());
          const templateHeader = template.fields.map((f) =>
            f.split('(')[0].trim(),
          );

          // Check headers
          if (templateHeader.every((field) => header.includes(field))) {
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
          if (!_error && !customerUuid) {
            const customerIdx = header.indexOf('customer_uuid');
            if (
              customerIdx === -1 ||
              !results.data.slice(1).every((record) => record[customerIdx])
            ) {
              _error = 'customer';
            }
          }

          // Check plan names for resource records
          if (!_error && values.import_type === 'projects_with_resources') {
            const typeIdx = header.indexOf('type');
            const planIdx = header.indexOf('plan_name');
            if (typeIdx !== -1 && planIdx !== -1) {
              const resourceRecords = results.data
                .slice(1)
                .filter((record) => record[typeIdx] === 'resource');
              if (resourceRecords.some((record) => !record[planIdx])) {
                _error = 'plan';
              }
            }
          }

          // Check OECD field
          if (!_error && isFeatureVisible(ProjectFeatures.oecd_fos_2007_code)) {
            const isOecdRequired =
              ENV.plugins.WALDUR_CORE?.OECD_FOS_2007_CODE_MANDATORY;
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
          resolve(
            translate(
              'The imported data format does not match the template format.',
            ),
          );
        } else if (_error === 'empty') {
          resolve(translate('The imported file is empty.'));
        } else if (_error === 'customer') {
          resolve(
            translate(
              'The organization UUID is not specified in one or more records.',
            ),
          );
        } else if (_error === 'oecd') {
          resolve(translate('OECD code is required for projects.'));
        } else if (_error === 'invalid_oecd') {
          resolve(translate('OECD code must be a number.'));
        } else if (_error === 'plan') {
          resolve(
            translate(
              'The plan name is not specified in one or more resource records.',
            ),
          );
        } else {
          resolve(undefined);
        }
      },
      error: function () {
        resolve(translate('Failed to parse CSV file.'));
      },
    });
  });
};

interface Step4Props {
  context: {
    customer?: Customer;
  };
}

export const Step4UploadFile: FC<Step4Props> = ({ context: { customer } }) => {
  const { values } = useFormState<ProjectImportFormData>();
  const importType = values?.import_type;

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
        validate={(value) =>
          validateCsvFile({ ...values, file: value }, customer)
        }
        component={TemplateUploaderField}
      />
    </div>
  );
};
