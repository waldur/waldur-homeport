import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { formatDate } from '@waldur/core/dateUtils';
import { withTranslation, translate } from '@waldur/i18n';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { renderFieldOrDash } from '@waldur/table/utils';

import { CurrentCostField, ExportCurrentCostField } from './CurrentCostField';
import { CustomerExpandableRow } from './CustomerExpandableRow';
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

export const TableComponent: FunctionComponent<any> = (props) => {
  const { filterColumns, customerListFilter } = props;
  const accountingPeriodIsCurrent =
    customerListFilter.accounting_period &&
    customerListFilter.accounting_period.value.current;
  const columns = filterColumns([
    {
      title: translate('Organization'),
      render: OrganizationLink,
      orderField: 'name',
    },
    {
      title: translate('Abbreviation'),
      render: AbbreviationField,
      orderField: 'abbreviation',
    },
    {
      title: translate('Created'),
      render: CreatedDateField,
      orderField: 'created',
    },
    {
      title: translate('Start day of accounting'),
      render: AccountingStartDateField,
      orderField: 'accounting_start_date',
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
    },
    {
      title: renderTitleWithPriceTooltip(translate('Current cost')),
      render: CurrentCostField,
      visible: accountingPeriodIsCurrent,
      orderField: 'current_cost',
    },
    {
      title: renderTitleWithPriceTooltip(translate('Estimated cost')),
      render: EstimatedCostField,
      visible: accountingPeriodIsCurrent,
      orderField: 'estimated_cost',
    },
    {
      title: renderTitleWithPriceTooltip(translate('Cost')),
      render: CurrentCostField,
      visible: !accountingPeriodIsCurrent,
      orderField: 'current_cost',
    },
  ]);

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Organizations')}
      hasQuery={true}
      showPageSizeSelector={true}
      enableExport={true}
      expandableRow={CustomerExpandableRow}
    />
  );
};

const exportRow = (row, props) => {
  const base = [
    row.name,
    row.abbreviation,
    formatDate(row.created),
    formatDate(row.accounting_start_date),
    renderFieldOrDash(row.agreement_number),
    ExportCurrentCostField({ row }),
  ];
  return props.customerListFilter.accounting_period &&
    props.customerListFilter.accounting_period.value.current
    ? [...base, ExportEstimatedCostField({ row })]
    : base;
};

const exportFields = (props) => {
  const base = [
    translate('Organization'),
    translate('Abbreviation'),
    translate('Created'),
    translate('Start day of accounting'),
    translate('Agreement number'),
  ];
  const accountingPeriodIsCurrent =
    props.customerListFilter.accounting_period &&
    props.customerListFilter.accounting_period.value.current;
  const vatNotIncluded = ENV.accountingMode === 'accounting';
  const vatMessage = vatNotIncluded
    ? translate('VAT is not included')
    : translate('VAT is included');
  return accountingPeriodIsCurrent
    ? [
        ...base,
        `${translate('Current cost')} (${vatMessage})`,
        `${translate('Estimated cost')} (${vatMessage})`,
      ]
    : [...base, `${translate('Cost')} (${vatMessage})`];
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

const TableOptions = {
  table: 'customerList',
  fetchData: createFetcher('customers'),
  queryField: 'query',
  mapPropsToFilter: (props) => formatFilter(props.customerListFilter),
  exportRow,
  exportFields,
};

const mapStateToProps = (state: RootState) => ({
  customerListFilter: getFormValues('customerListFilter')(state),
});

const enhance = compose(
  connect(mapStateToProps),
  connectTable(TableOptions),
  withTranslation,
);

export const CustomerList = enhance(TableComponent);
