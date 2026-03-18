import Papa from 'papaparse';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useField, useForm } from 'react-final-form';
import { useDispatch } from 'react-redux';

import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';
import { SkipErrorsCheck } from '@waldur/project/import/SkipErrorsCheck';
import { showError } from '@waldur/store/notify';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import templateFile from './course_accounts_template.json';
import {
  hasCourseAccountsErrors,
  RawCourseAccount,
  validateCourseAccountCreation,
} from './utils';

const statusMessages = {
  description: translate('Missing description'),
  invalid_email: translate('Invalid email'),
};

const StatusField = ({ row }) => {
  const validate = validateCourseAccountCreation(row);
  return (
    <Badge variant={validate.valid ? 'success' : 'danger'} pill outline>
      {validate.valid ? translate('OK') : statusMessages[validate.errors[0]]}
    </Badge>
  );
};

const parseFile = (file: File) => {
  return new Promise<RawCourseAccount[]>((resolve, reject) =>
    Papa.parse(file, {
      skipEmptyLines: true,
      complete: function (results: { data: Array<Array<string>> }) {
        if (Array.isArray(results?.data) && Array.isArray(results?.data[0])) {
          const header = results.data[0];

          const fields = templateFile.fields;
          const objectFields = header.reduce((acc, field, idx) => {
            if (fields.includes(field)) {
              acc.push({ field, idx });
            }
            return acc;
          }, []);
          const rows = results.data.slice(1);

          const accounts = rows.map((row) => {
            const accountData = {};
            objectFields.forEach(({ field, idx }) => {
              accountData[field] = String(row[idx]).trim();
            });
            return accountData as RawCourseAccount;
          });

          resolve(accounts);
        }
        resolve([]);
      },
      error: function (error) {
        reject(error);
      },
    }),
  );
};

export const Step2PreviewAndCreate = ({ skipErrors, setSkipErrors }) => {
  const dispatch = useDispatch();
  const [data, setData] = useState<RawCourseAccount[]>([]);

  const field = useField('file');
  const form = useForm();

  const parseCsvFile = useCallback(
    (acceptedFiles: File[]) => {
      const _file = acceptedFiles[0];

      if (!_file) {
        dispatch(showError(translate('No file has been imported')));
        return;
      }
      parseFile(_file).then((_data) => {
        setData(_data);
        form.change('data', _data);
      });
    },
    [dispatch, setData, form],
  );

  useEffect(() => {
    if (field.input.value?.length > 0) {
      parseCsvFile(field.input.value);
    }
  }, [field.input.value, parseCsvFile]);

  const tableProps = useTable({
    table: 'ImportCoursesPreview',
    fetchData: () =>
      Promise.resolve({
        rows: data,
        resultCount: data.length,
      }),
    filter: useMemo(() => ({ _rev: data }), [data]),
  });

  const columns = useMemo<Column<RawCourseAccount>[]>(
    () =>
      [
        {
          title: translate('Email'),
          render: ({ row }) => renderFieldOrDash(row.email),
        },
        {
          title: translate('Description'),
          render: ({ row }) => renderFieldOrDash(row.description),
        },
        {
          title: translate('Status'),
          render: StatusField,
        },
      ].filter(Boolean),
    [data],
  );

  const hasErrors = useMemo(() => hasCourseAccountsErrors(data), [data]);

  return (
    <div>
      <div className="d-flex justify-content-between text-muted mb-3">
        <span>{translate('{n} users identified', { n: data.length })}</span>
        <span>{translate('Verify your data before importing')}</span>
      </div>
      <Table
        {...tableProps}
        columns={columns}
        hasActionBar={false}
        fullWidth
        cardBordered={false}
        minHeight="auto"
        hasQuery
        footer={
          hasErrors && (
            <SkipErrorsCheck checked={skipErrors} onChange={setSkipErrors} />
          )
        }
      />
    </div>
  );
};
