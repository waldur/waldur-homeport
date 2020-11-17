import * as React from 'react';
import * as ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import {
  SUPPORT_CUSTOMERS_FORM_ID,
  SUPPORT_CUSTOMER_LIST,
} from '@waldur/customer/list/constants';
import { OrganizationDetailsButton } from '@waldur/customer/list/OrganizationDetailsButton';
import { OrganizationEditButton } from '@waldur/customer/list/OrganizationEditButton';
import { SetLocationButton } from '@waldur/customer/list/SetLocationButton';
import { translate } from '@waldur/i18n';
import { connectTable, createFetcher, Table } from '@waldur/table';
import { renderFieldOrDash } from '@waldur/table/utils';
import { isStaff } from '@waldur/workspace/selectors';

import { OrganizationLink } from './OrganizationLink';

export const TableComponent = (props) => {
  const columns = [
    {
      title: translate('Name'),
      render: OrganizationLink,
      orderField: 'name',
    },
    {
      title: translate('Abbreviation'),
      render: ({ row }) => renderFieldOrDash(row.abbreviation),
    },
    {
      title: translate('Contact email'),
      render: ({ row }) => renderFieldOrDash(row.email),
    },
    {
      title: translate('Contact phone'),
      render: ({ row }) => renderFieldOrDash(row.phone_number),
    },
    {
      title: translate('Actions'),
      render: ({ row }) => {
        return (
          <ButtonGroup>
            {props.isStaff && <OrganizationEditButton customer={row} />}
            {props.isStaff && <SetLocationButton customer={row} />}
            <OrganizationDetailsButton customer={row} />
          </ButtonGroup>
        );
      },
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Organizations')}
      hasQuery={true}
      showPageSizeSelector={true}
    />
  );
};

const TableOptions = {
  table: SUPPORT_CUSTOMER_LIST,
  fetchData: createFetcher('customers'),
  queryField: 'query',
  mapPropsToFilter: (props) => {
    const filter: Record<string, string> = {};
    if (props.filter) {
      if (props.filter.accounting_is_running) {
        filter.accounting_is_running = props.filter.accounting_is_running.value;
      }
      if (props.filter.is_service_provider) {
        filter.is_service_provider = props.filter.is_service_provider.value;
      }
      if (props.filter.division_type) {
        filter.division_type_uuid = props.filter.division_type.map(
          (option) => option.uuid,
        );
      }
      if (props.filter.division) {
        filter.division_uuid = props.filter.division.uuid;
      }
    }
    return filter;
  },
};

const mapStateToProps = (state) => ({
  filter: getFormValues(SUPPORT_CUSTOMERS_FORM_ID)(state),
  isStaff: isStaff(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const SupportCustomerList = enhance(TableComponent);
