import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDate } from '@waldur/core/dateUtils';
import { ENV } from '@waldur/core/services';
import { withTranslation, translate } from '@waldur/i18n';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { connectAngularComponent } from '@waldur/store/connect';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { renderFieldOrDash } from '@waldur/table-react/utils';

import { CurrentCostField } from './CurrentCostField';
import { CustomerExpandableRow } from './CustomerExpandableRow';
import { EstimatedCostField } from './EstimatedCostField';
import { OrganizationLink } from './OrganizationLink';

const AbbreviationField = ({ row }) => <span>{renderFieldOrDash(row.abbreviation)}</span>;

const CreatedDateField = ({ row }) => <span>{renderFieldOrDash(formatDate(row.created))}</span>;

const AccountingStartDateField = ({ row }) => <span>{renderFieldOrDash(formatDate(row.accounting_start_date))}</span>;

const RegistrationCodeField = ({ row }) => <span>{renderFieldOrDash(row.registration_code)}</span>;

const AgreementNumberField = ({ row }) => <span>{renderFieldOrDash(row.agreement_number)}</span>;

export const TableComponent = props => {
  const { filterColumns, customerListFilter } = props;
  const accountingPeriodIsCurrent = customerListFilter.accounting_period && customerListFilter.accounting_period.value.current;
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

const renderTitleWithPriceTooltip = title =>
  <><PriceTooltip/>{' '}{title}</>;

const exportRow = (row, props) => {
  const base = [
    row.name,
    row.abbreviation,
    formatDate(row.created),
    formatDate(row.accounting_start_date),
    CurrentCostField({row}),
  ];
  return props.customerListFilter.accounting_period && props.customerListFilter.accounting_period.value.current ?
    [...base, EstimatedCostField({row})] :
    base;
};

const exportFields = props => {
  const base = [
    translate('Organization'),
    translate('Abbreviation'),
    translate('Created'),
    translate('Start day of accounting'),
  ];
  const accountingPeriodIsCurrent = props.customerListFilter.accounting_period && props.customerListFilter.accounting_period.value.current;
  const vatNotIncluded = ENV.accountingMode === 'accounting';
  const vatMessage = vatNotIncluded ? translate('VAT is not included') : translate('VAT is included');
  return accountingPeriodIsCurrent ? [
    ...base,
    `${translate('Current cost')} (${vatMessage})`,
    `${translate('Estimated cost')} (${vatMessage})`,
  ] : [
    ...base,
    `${translate('Cost')} (${vatMessage})`,
  ];
};

const TableOptions = {
  table: 'customerList',
  fetchData: createFetcher('customers'),
  queryField: 'query',
  mapPropsToFilter: props => formatFilter(props.customerListFilter),
  exportRow,
  exportFields,
};

const formatFilter = filter => {
  if (filter) {
    if (filter.accounting_period) {
      return {
        accounting_is_running: filter.accounting_is_running ? filter.accounting_is_running.value : undefined,
        year: filter.accounting_period.value.year,
        month: filter.accounting_period.value.month,
      };
    }
    return filter;
  }
};

const mapStateToProps = state => ({
  customerListFilter: getFormValues('customerListFilter')(state),
});

const enhance = compose(
  connect(mapStateToProps),
  connectTable(TableOptions),
  withTranslation,
);

export const CustomerList = enhance(TableComponent);

export default connectAngularComponent(CustomerList);
