import * as React from 'react';
import * as ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { OrganizationDetailsButton } from '@waldur/customer/list/OrganizationDetailsButton';
import { OrganizationEditButton } from '@waldur/customer/list/OrganizationEditButton';
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
  table: 'supportCustomerList',
  fetchData: createFetcher('customers'),
  queryField: 'query',
};

const mapStateToProps = (state) => ({
  isStaff: isStaff(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const SupportCustomerList = enhance(TableComponent);
