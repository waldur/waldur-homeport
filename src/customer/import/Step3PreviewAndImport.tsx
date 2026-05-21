import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormState } from 'react-final-form';
import { useToggle } from 'react-use';
import { Customer } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { WizardForm, WizardFormStepProps } from '@/form/WizardForm';
import { translate } from '@/i18n';
import { SkipErrorsCheck } from '@/project/import/SkipErrorsCheck';
import { useNotify } from '@/store/notify';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import {
  deleteDuplicateRecords,
  getCustomerOptionalFields,
  parseOrganizationsFile,
  validateOrganizationCreation,
} from './utils';

const statusMessages = {
  name: translate('Missing name'),
  email: translate('Missing email'),
  invalid_email: translate('Invalid email'),
  invalid_tax: translate('Invalid tax percent'),
};

const StatusField = ({ row }) => {
  const validate = validateOrganizationCreation(row);
  return (
    <Badge variant={validate.valid ? 'success' : 'danger'} pill outline>
      {validate.valid ? translate('OK') : statusMessages[validate.errors[0]]}
    </Badge>
  );
};

export const Step3PreviewAndImport: FC<WizardFormStepProps> = (props) => {
  const { showError } = useNotify();
  const [data, setData] = useState<Customer[]>([]);
  const [skipErrors, setSkipErrors] = useToggle(false);

  const parseCsvFile = useCallback(
    (acceptedFiles: File[]) => {
      const _file = acceptedFiles[0];

      if (!_file) {
        showError(translate('No file has been imported'));
        return;
      }
      parseOrganizationsFile(_file).then((_data) => {
        // Delete duplicate records
        const { duplicates, rows } = deleteDuplicateRecords(_data, [
          'name',
          'email',
        ]);
        if (duplicates) {
          showError(
            translate('{count} duplicate records were removed.', {
              count: duplicates,
            }),
          );
        }
        setData(rows);
      });
    },
    [setData, showError],
  );

  const refToolbar = useRef<HTMLDivElement>(null);

  const tableProps = useTable({
    table: 'ImportOrganizationsPreview',
    fetchData: (request) => {
      let rows = [...data];
      const q = (request.filter?.query || '').trim().toLowerCase();
      if (q) {
        rows = rows.filter((row) => row.name.toLowerCase().includes(q));
      }
      return Promise.resolve({
        rows,
        resultCount: rows.length,
      });
    },
    queryField: 'query',
  });

  const columns = useMemo<Column<Customer>[]>(
    () =>
      [
        {
          title: translate('Organization name'),
          render: ({ row }) => renderFieldOrDash(row.name),
        },
        {
          title: translate('Email'),
          render: ({ row }) => renderFieldOrDash(row.email),
        },
        ...getCustomerOptionalFields().map(
          (field) =>
            data.some((record) => Boolean(record[field.key])) && {
              title: field.title,
              render: ({ row }) => renderFieldOrDash(row[field.key]),
            },
        ),
        {
          title: translate('Status'),
          render: StatusField,
        },
      ].filter(Boolean) as Column<Customer>[],
    [data],
  );

  const tooltip = useMemo(() => {
    if (!data?.length) {
      return translate('At least one organization is required.');
    }
    const fixMessage = translate('Please fix data or skip records with errors');
    for (let i = 0; i < data.length; i++) {
      const validate = validateOrganizationCreation(data[i]);
      let msg = '';
      if (!validate.valid) {
        if (validate.errors.includes('name')) {
          msg = translate('Name is required.');
        } else if (
          validate.errors.includes('email') ||
          validate.errors.includes('invalid_email')
        ) {
          msg = translate('Valid email is required.');
        } else if (validate.errors.includes('invalid_tax')) {
          msg = translate('Tax percent must be a number');
        }
      }
      if (msg) return msg + ' ' + fixMessage;
    }
    return null;
  }, [data]);

  const { values } = useFormState({ subscription: { values: true } });
  const file = values?.file;

  useEffect(() => {
    if (file?.length > 0) {
      parseCsvFile(file);
    }
  }, []);
  return (
    <WizardForm
      {...props}
      submitDisabled={!!tooltip && !skipErrors}
      submitTooltip={(!skipErrors && tooltip) || undefined}
    >
      <div>
        <div className="d-flex justify-content-start mb-3">
          <div ref={refToolbar}>{/* Portal destination */}</div>
        </div>
        <div className="d-flex justify-content-between text-muted mb-3">
          <span>
            {data.length} {translate('Organizations')}
          </span>
          <span>{translate('Verify your data before importing')}</span>
        </div>
        <Table
          {...tableProps}
          columns={columns}
          verboseName={translate('Organizations')}
          hasActionBar={false}
          fullWidth
          cardBordered={false}
          minHeight="auto"
          portal={{ toolbar: refToolbar?.current }}
          hasQuery
          footer={
            Boolean(tooltip && data?.length) && (
              <SkipErrorsCheck checked={skipErrors} onChange={setSkipErrors} />
            )
          }
        />
      </div>
    </WizardForm>
  );
};
