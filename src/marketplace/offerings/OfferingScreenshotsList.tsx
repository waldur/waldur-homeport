import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { OfferingScreenshotsActions } from '@waldur/marketplace/offerings/OfferingScreenshotsActions';
import { OfferingScreenshotsListTablePlaceholder } from '@waldur/marketplace/offerings/OfferingScreenshotsListTablePlaceholder';
import { ScreenshotThumbnail } from '@waldur/marketplace/offerings/ScreenshotThumbnail';
import { SCREENSHOTS_TABLE_NAME } from '@waldur/marketplace/offerings/store/constants';
import { getOffering } from '@waldur/marketplace/offerings/store/selectors';
import { Offering, Screenshot } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';
import { connectTable, createFetcher, Table } from '@waldur/table-react';

const openViewOfferingScreenshotDialog = (screenshot: Screenshot) =>
  openModalDialog('marketplaceViewOfferingScreenshotDialog', {
    resolve: screenshot,
  });

export const TableComponent = props => {
  const { translate } = props;

  const columns = [
    {
      title: translate('Thumbnail'),
      render: ({ row }) => (
        <ScreenshotThumbnail
          screenshot={row}
          onClick={() => props.openViewScreenshotDialog(row)}
        />
      ),
    },
    {
      title: translate('Name'),
      render: ({ row }) => row.name,
      orderField: 'name',
    },
    {
      title: translate('Description'),
      render: ({ row }) => row.description,
    },
    {
      title: translate('Created'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
    },
    {
      title: translate('Actions'),
      render: ({ row }) => {
        return <OfferingScreenshotsActions row={row} />;
      },
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      placeholderComponent={<OfferingScreenshotsListTablePlaceholder />}
      verboseName={translate('Offerings screenshots')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      enableExport={true}
    />
  );
};

const mapPropsToFilter = props => {
  const filter: Record<string, string | boolean> = {};
  if (props.offering) {
    filter.offering_uuid = props.offering.uuid;
  }
  return filter;
};

const TableOptions = {
  table: SCREENSHOTS_TABLE_NAME,
  fetchData: createFetcher('marketplace-screenshots'),
  mapPropsToFilter,
  exportRow: (row: Offering) => [
    row.name,
    row.description,
    formatDateTime(row.created),
  ],
  exportFields: ['Name', 'Description', 'Created'],
};

const mapStateToProps = state => ({
  offering: getOffering(state).offering,
});

const mapDispatchToProps = dispatch => ({
  openViewScreenshotDialog: image =>
    dispatch(openViewOfferingScreenshotDialog(image)),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  connectTable(TableOptions),
);

export const OfferingScreenshotsList = enhance(TableComponent);
