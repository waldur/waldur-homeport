import { FunctionComponent, useCallback, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { financialReportsList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { formatDate } from '@/core/dateUtils';
import { FinancialReportSendButton } from '@/customer/list/FinancialReportSendButton';
import { translate } from '@/i18n';
import { PriceTooltip } from '@/price/PriceTooltip';
import { createFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import {
  FinancialReportsFilter,
  FinancialReportsFilterFormData,
  FinancialReportsFilterFormId,
  selectFinancialReportsFilter,
} from '@/table/generated/FinancialReportsFilter';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { Customer } from '@/workspace/types';

import { CurrentCostField } from './CurrentCostField';
import { CustomerExpandableRow } from './CustomerExpandableRow';
import {
  EstimatedCostField,
  ExportEstimatedCostField,
} from './EstimatedCostField';
import { OrganizationNameLink } from './OrganizationNameLink';
import { TotalCostContainer } from './TotalCostComponent';

const AbbreviationField = ({ row }) => (
  <>{renderFieldOrDash(row.abbreviation)}</>
);

const CreatedDateField = ({ row }) => (
  <>{renderFieldOrDash(formatDate(row.created))}</>
);

const AccountingStartDateField = ({ row }) => (
  <>{renderFieldOrDash(formatDate(row.accounting_start_date))}</>
);

const RegistrationCodeField = ({ row }) => (
  <>{renderFieldOrDash(row.registration_code)}</>
);

const AgreementNumberField = ({ row }) => (
  <>{renderFieldOrDash(row.agreement_number)}</>
);

const renderTitleWithPriceTooltip = (title) => (
  <>
    <PriceTooltip /> {title}
  </>
);

const CustomerListTable: FunctionComponent<{
  accountingPeriods;
}> = ({ accountingPeriods }) => {
  const { values } = useFormState<FinancialReportsFilterFormData>();
  const accountingPeriodIsCurrent = values?.accounting_period?.value?.current;
  const vatMessage =
    ENV.accountingMode === 'accounting'
      ? translate('VAT is not included')
      : translate('VAT is included');

  const columns: Column<Customer>[] = [
    {
      title: translate('Organization'),
      render: OrganizationNameLink,
      orderField: 'name',
      export: 'name',
    },
    {
      title: translate('Abbreviation'),
      render: AbbreviationField,
      orderField: 'abbreviation',
      export: 'abbreviation',
    },
    {
      title: translate('Created'),
      render: CreatedDateField,
      orderField: 'created',
      export: (row) => formatDate(row.created),
      exportKeys: ['created'],
    },
    {
      title: translate('Start day of accounting'),
      render: AccountingStartDateField,
      orderField: 'accounting_start_date',
      export: (row) => formatDate(row.accounting_start_date),
      exportKeys: ['accounting_start_date'],
    },
    {
      title: translate('Registration code'),
      render: RegistrationCodeField,
      orderField: 'registration_code',
    },
    {
      title: translate('Agreement number'),
      render: AgreementNumberField,
      orderField: 'agreement_number',
      export: 'agreement_number',
    },
  ];

  if (accountingPeriodIsCurrent) {
    columns.push({
      title: renderTitleWithPriceTooltip(translate('Estimated cost')),
      render: EstimatedCostField,
      orderField: 'estimated_cost',
      exportTitle: `${translate('Estimated cost')} (${vatMessage})`,
      export: (row) => ExportEstimatedCostField({ row }),
      exportKeys: ['payment_profiles', 'billing_price_estimate'],
    });
  } else {
    columns.push({
      title: renderTitleWithPriceTooltip(translate('Cost')),
      render: CurrentCostField,
      orderField: 'total_cost',
      exportTitle: `${translate('Cost')} (${vatMessage})`,
      export: (row) => ExportEstimatedCostField({ row }),
    });
  }

  const filter = useMemo(() => selectFinancialReportsFilter(values), [values]);

  const props = useTable({
    table: 'customerList',
    fetchData: createFetcher(financialReportsList),
    queryField: 'query',
    filter,
  });

  const expandableRow = useCallback(
    ({ row }) => (
      <ExpandableContainer>
        <CustomerExpandableRow row={row} providerUUID={filter?.customer_uuid} />
      </ExpandableContainer>
    ),

    [filter],
  );

  return (
    <Table
      {...props}
      formId={FinancialReportsFilterFormId}
      columns={columns}
      subtitle={<TotalCostContainer />}
      verboseName={translate('Organizations')}
      hasQuery={true}
      showPageSizeSelector={true}
      enableExport={true}
      expandableRow={expandableRow}
      tableActions={<FinancialReportSendButton />}
      filters={<FinancialReportsFilter accountingPeriods={accountingPeriods} />}
    />
  );
};

export const CustomerList: FunctionComponent<{
  initialValues;
  accountingPeriods;
}> = (props) => (
  <Form
    id={FinancialReportsFilterFormId}
    initialValues={props.initialValues}
    onSubmit={() => {}}
    subscription={{ values: true }}
  >
    {() => <CustomerListTable {...props} />}
  </Form>
);
