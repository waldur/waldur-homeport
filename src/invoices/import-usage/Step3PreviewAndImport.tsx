import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { FormCheck } from 'react-bootstrap';
import { useForm, useFormState } from 'react-final-form';
import { useToggle } from 'react-use';

import { Badge } from '@/core/Badge';
import { defaultCurrency } from '@/core/formatCurrency';
import { Tip } from '@/core/Tooltip';
import { truncate } from '@/core/utils';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { WizardForm, WizardFormStepProps } from '@/wizard';

import { fetchAllCustomers } from './api';
import { ColumnMapping, ExcelParseResult, UsageImportRow } from './types';
import { getImportSummary, mapRowsToUsage } from './utils';

interface Step3Props extends WizardFormStepProps {
  data: {
    parseResult: ExcelParseResult | null;
  };
}

const statusMessages = {
  ready: translate('Ready'),
  skipped: translate('Skipped'),
  error: translate('Error'),
  created: translate('Created'),
};

const statusVariants = {
  ready: 'default',
  skipped: 'warning',
  error: 'danger',
  created: 'success',
};

const StatusField = ({ row }: { row: UsageImportRow }) => (
  <Tip id={`tip-${row.uuid}`} label={row.error}>
    <Badge variant={statusVariants[row.status]} pill outline>
      {statusMessages[row.status]}
    </Badge>
  </Tip>
);

const WithTooltip = ({ label = '', len = 24 }) =>
  label?.length > len ? (
    <Tip label={label} id="tip-truncated">
      {truncate(label, len)}
    </Tip>
  ) : (
    label || DASH_ESCAPE_CODE
  );

const SkipErrorsCheck = ({ checked, onChange }) => (
  <FormCheck
    id="confirm-skip-errors"
    type="checkbox"
    className="form-check-custom form-check-sm border-top pt-3"
    checked={checked}
    onChange={onChange}
    label={translate('Skip records with errors')}
  />
);

export const Step3PreviewAndImport: FC<Step3Props> = (props) => {
  const { showError } = useNotify();

  const [data, setData] = useState<UsageImportRow[]>([]);
  const [loading, setLoading] = useToggle(true);
  const [skipErrors, setSkipErrors] = useToggle(false);

  const refToolbar = useRef<HTMLDivElement>(null);

  const tableProps = useTable({
    table: 'ImportUsagePreview',
    fetchData: (request) => {
      let rows = [...data];
      const q = (request.filter?.query || '').trim().toLowerCase();
      if (q) {
        rows = rows.filter(
          (row) =>
            row.customerName.toLowerCase().includes(q) ||
            row.itemName.toLowerCase().includes(q),
        );
      }
      return Promise.resolve({
        rows,
        resultCount: rows.length,
      });
    },
    queryField: 'query',
  });

  useEffect(() => {
    tableProps.fetch();
  }, [data]);

  const columns = useMemo(
    () => [
      {
        title: translate('Customer'),
        render: ({ row }: { row: UsageImportRow }) => (
          <div>
            <WithTooltip label={row.customerName} />
            {row.customerMatched && (
              <Badge variant="success" light className="ms-2">
                {translate('Matched')}
              </Badge>
            )}
          </div>
        ),
      },
      {
        title: translate('Item name'),
        render: ({ row }: { row: UsageImportRow }) => (
          <WithTooltip label={row.itemName} />
        ),
      },
      {
        title: translate('Amount'),
        render: ({ row }: { row: UsageImportRow }) =>
          defaultCurrency(row.amount),
      },
      {
        title: translate('Article code'),
        render: ({ row }: { row: UsageImportRow }) =>
          row.articleCode || DASH_ESCAPE_CODE,
      },
      {
        title: translate('Status'),
        render: ({ row }: { row: UsageImportRow }) => <StatusField row={row} />,
      },
    ],
    [],
  );

  const summary = useMemo(() => getImportSummary(data), [data]);

  const hasErrors = summary.errors > 0;

  const { values } = useFormState({
    subscription: { values: true, submitting: true },
  });
  const form = useForm();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const customersList = await fetchAllCustomers();
        const parseResult = props.data?.parseResult;
        if (!parseResult) return;

        const mapping: ColumnMapping = {
          customerColumn: values.customerColumn?.value,
          itemNameColumn: values.itemNameColumn?.value,
          amountColumn: values.amountColumn?.value,
          articleCodeColumn: values.articleCodeColumn?.value,
        };

        const mappedRows = mapRowsToUsage(
          parseResult.rows,
          mapping,
          customersList,
        );

        setData(mappedRows);
        form.change('mappedData', mappedRows);
      } catch {
        showError(translate('Failed to load customers'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <WizardForm
      {...props}
      submitDisabled={
        data.length === 0 ||
        (hasErrors && !skipErrors) ||
        (summary.ready === 0 && summary.skipped === data.length)
      }
      submitTooltip={
        hasErrors && !skipErrors
          ? translate('Please fix errors or check "Skip records with errors"')
          : undefined
      }
    >
      <div>
        <div className="d-flex justify-content-start mb-3">
          <div ref={refToolbar}>{/* Portal destination */}</div>
        </div>
        <div className="d-flex justify-content-between text-muted mb-3">
          <span>
            {summary.errors === 0 && summary.skipped === 0
              ? translate('{n} ready to import', { n: summary.ready })
              : translate('{ready} ready, {skipped} skipped, {errors} errors', {
                  ready: summary.ready,
                  skipped: summary.skipped,
                  errors: summary.errors,
                })}
          </span>
          <span>{translate('Verify your data before importing')}</span>
        </div>
        <Table
          {...tableProps}
          columns={columns}
          verboseName={translate('Usage items')}
          hasActionBar={false}
          fullWidth
          cardBordered={false}
          minHeight="auto"
          portal={{ toolbar: refToolbar?.current }}
          hasQuery
          loading={loading}
          footer={
            hasErrors && (
              <SkipErrorsCheck checked={skipErrors} onChange={setSkipErrors} />
            )
          }
        />
      </div>
    </WizardForm>
  );
};
