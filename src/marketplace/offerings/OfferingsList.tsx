import { FunctionComponent } from 'react';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { getLabel } from '@waldur/marketplace/common/registry';
import { OfferingsListExpandableRow } from '@waldur/marketplace/offerings/expandable/OfferingsListExpandableRow';
import {
  OFFERING_TABLE_NAME,
  PUBLIC_OFFERINGS_FILTER_FORM_ID,
} from '@waldur/marketplace/offerings/store/constants';
import { RootState } from '@waldur/store/reducers';
import { Table, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';
import { renderFieldOrDash } from '@waldur/table/utils';
import {
  getCustomer,
  getUser,
  isOwnerOrStaff,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

import { Offering } from '../types';

import { useOfferingDropdownActions } from './hooks';
import { OfferingActions } from './OfferingActions';
import { OfferingNameColumn } from './OfferingNameColumn';
import { OfferingsListTablePlaceholder } from './OfferingsListTablePlaceholder';
import { OfferingStateCell } from './OfferingStateCell';

export const TableComponent: FunctionComponent<any> = (props) => {
  const organizationColumn = props?.hasOrganizationColumn
    ? [
        {
          title: translate('Organization'),
          render: ({ row }) => renderFieldOrDash(row.customer_name),
        },
      ]
    : [];

  const columns = [
    {
      title: translate('Name'),
      render: OfferingNameColumn,
      orderField: 'name',
    },
    ...organizationColumn,
    {
      title: translate('Category'),
      render: ({ row }) => <>{row.category_title}</>,
    },
    {
      title: translate('Created'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
    },
    {
      title: translate('State'),
      render: OfferingStateCell,
    },
    {
      title: translate('Type'),
      render: ({ row }) => getLabel(row.type),
    },
  ];

  const dropdownActions = useOfferingDropdownActions();

  return (
    <Table
      {...props}
      placeholderComponent={<OfferingsListTablePlaceholder />}
      columns={columns}
      verboseName={translate('Offerings')}
      dropdownActions={dropdownActions}
      initialSorting={{ field: 'created', mode: 'desc' }}
      enableExport={true}
      hoverableRow={OfferingActions}
      expandableRow={OfferingsListExpandableRow}
      hasQuery={true}
    />
  );
};

interface FilterData {
  state: { value: string }[];
}

type StateProps = Readonly<ReturnType<typeof mapStateToProps>>;

const mapPropsToFilter = (props: StateProps) => {
  const filter: Record<string, any> = {
    billable: true,
    shared: true,
  };
  if (props.customer) {
    filter.customer_uuid = props.customer.uuid;
  }
  if (props.filter?.state) {
    filter.state = props.filter.state.map((option) => option.value);
  }
  if (props.isServiceManager && !props.isOwnerOrStaff) {
    filter.service_manager_uuid = props.user.uuid;
  }
  return filter;
};

export const TableOptions: TableOptionsType = {
  table: OFFERING_TABLE_NAME,
  fetchData: createFetcher('marketplace-provider-offerings'),
  mapPropsToFilter,
  exportRow: (row: Offering) => [
    row.name,
    formatDateTime(row.created),
    row.category_title,
    row.state,
    row.type,
  ],
  exportFields: ['Name', 'Created', 'Category', 'State', 'Type'],
  queryField: 'keyword',
};

const mapStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
  user: getUser(state),
  isServiceManager: isServiceManagerSelector(state),
  isOwnerOrStaff: isOwnerOrStaff(state),
  filter: getFormValues(PUBLIC_OFFERINGS_FILTER_FORM_ID)(state) as FilterData,
});
