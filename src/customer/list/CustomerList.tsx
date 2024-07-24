import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { formatDate } from '@waldur/core/dateUtils';
import { FinancialReportSendButton } from '@waldur/customer/list/FinancialReportSendButton';
import { translate } from '@waldur/i18n';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { Table, createFetcher } from '@waldur/table';
import { Column } from '@waldur/table/types';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';
import { Customer } from '@waldur/workspace/types';

import { CurrentCostField } from './CurrentCostField';
import { CustomerExpandableRow } from './CustomerExpandableRow';
import { CustomerListFilter } from './CustomerListFilter';
import {
  EstimatedCostField,
  ExportEstimatedCostField,
} from './EstimatedCostField';
import { OrganizationLink } from './OrganizationLink';

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

export const CustomerList: FunctionComponent<{
  initialValues;
  accountingPeriods;
}> = ({ initialValues, accountingPeriods }) => {
  const customerListFilter: any = useSelector(
    getFormValues('customerListFilter'),
  );
  const accountingPeriodIsCurrent =
    customerListFilter?.accounting_period?.value.current;
  const vatMessage =
    ENV.accountingMode === 'accounting'
      ? translate('VAT is not included')
      : translate('VAT is included');

  const columns: Column<Customer>[] = [
    {
      title: translate('Organization'),
      render: OrganizationLink,
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

  const filter = useMemo(
    () => formatFilter(customerListFilter),
    [customerListFilter],
  );

  const props = useTable({
    table: 'customerList',
    fetchData: createFetcher('financial-reports'),
    queryField: 'query',
    filter,
  });

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Organizations')}
      hasQuery={true}
      showPageSizeSelector={true}
      enableExport={true}
      expandableRow={CustomerExpandableRow}
      actions={<FinancialReportSendButton />}
      filters={
        <CustomerListFilter
          initialValues={initialValues}
          accountingPeriods={accountingPeriods}
        />
      }
    />
  );
};

const formatFilter = (filter) => {
  if (filter) {
    if (filter.accounting_period) {
      return {
        accounting_is_running: filter.accounting_is_running
          ? filter.accounting_is_running.value
          : undefined,
        year: filter.accounting_period.value.year,
        month: filter.accounting_period.value.month,
      };
    }
    return filter;
  }
};
