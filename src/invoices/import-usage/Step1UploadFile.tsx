import { FC, useCallback, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Field } from 'redux-form';

import { required } from '@/core/validators';
import { FieldError, SelectField } from '@/form';
import { AttachmentItem } from '@/form/upload/AttachmentItem';
import { UploadContainer } from '@/form/upload/UploadContainer';
import { WizardForm, WizardFormStepProps } from '@/form/WizardForm';
import { translate } from '@/i18n';

import { ExcelParseResult } from './types';
import { getMonthOptions, getYearOptions, parseExcelFile } from './utils';

interface Step1Props extends WizardFormStepProps {
  data: {
    onFileParsed: (result: ExcelParseResult) => void;
  };
}

const asyncValidate = (values) =>
  new Promise<void>((resolve, reject) => {
    if (!values.file?.length) {
      reject({ file: translate('Please import a file.') });
      return;
    }

    const file = values.file[0];
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];

    if (
      !validTypes.includes(file.type) &&
      !file.name.match(/\.(xlsx|xls|csv)$/i)
    ) {
      reject({
        file: translate(
          'Invalid format. Please import an Excel (.xlsx, .xls) or CSV file.',
        ),
      });
      return;
    }

    resolve();
  });

export const Step1UploadFile: FC<Step1Props> = (props) => {
  const yearOptions = useMemo(() => getYearOptions(), []);
  const monthOptions = useMemo(() => getMonthOptions(), []);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const handleFileParsed = useCallback(
    (result: ExcelParseResult) => {
      props.data?.onFileParsed?.(result);
    },
    [props.data],
  );

  return (
    <WizardForm
      {...props}
      asyncValidate={asyncValidate}
      asyncChangeFields={['file']}
      initialValues={{
        year: yearOptions.find((y) => y.value === currentYear),
        month: monthOptions.find((m) => m.value === currentMonth),
      }}
    >
      {() => {
        const handleFileChange = async (files: File[]) => {
          if (files.length > 0) {
            try {
              const result = await parseExcelFile(files[0]);
              handleFileParsed(result);
            } catch {
              // Error will be handled by form validation
            }
          }
        };

        return (
          <div className="text-muted">
            <h6 className="fw-bold mb-5">
              1. {translate('Select billing period')}
            </h6>
            <Row className="mb-6">
              <Col md={6}>
                <Field
                  name="year"
                  component={SelectField}
                  options={yearOptions}
                  validate={required}
                  placeholder={translate('Select year')}
                  isClearable={false}
                />
              </Col>
              <Col md={6}>
                <Field
                  name="month"
                  component={SelectField}
                  options={monthOptions}
                  validate={required}
                  placeholder={translate('Select month')}
                  isClearable={false}
                />
              </Col>
            </Row>

            <hr />

            <h6 className="fw-bold mb-5">2. {translate('Upload your file')}</h6>
            <Field
              name="file"
              validate={required}
              component={({ input: { value, onChange }, meta }) => (
                <>
                  <UploadContainer
                    onDrop={(files) => {
                      onChange(files);
                      handleFileChange(files);
                    }}
                    message={translate('Excel or CSV (max. 10 MB)')}
                    accept={{
                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                        ['.xlsx'],
                      'application/vnd.ms-excel': ['.xls'],
                      'text/csv': ['.csv'],
                    }}
                    multiple={false}
                    className="mb-3"
                    maxSize={10 * 1024 * 1024}
                  />

                  <ul className="mb-5">
                    <li>{translate('Supported formats')}: .xlsx, .xls, .csv</li>
                    <li>
                      {translate('Required columns')}:{' '}
                      {translate('Customer name, Item name, Amount')}
                    </li>
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
