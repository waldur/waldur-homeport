import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { SCREENSHOTS_TABLE_NAME } from '@waldur/marketplace/offerings/store/constants';
import { getOffering } from '@waldur/marketplace/offerings/store/selectors';
import { Offering, Screenshot } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';
import { RootState } from '@waldur/store/reducers';
import { connectTable, createFetcher, Table } from '@waldur/table';

import { ScreenshotsActions } from './ScreenshotsActions';
import { ScreenshotsListPlaceholder } from './ScreenshotsListPlaceholder';
import { ScreenshotThumbnail } from './ScreenshotThumbnail';

const ScreenshotDetailsDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ScreenshotDetailsDialog" */ './ScreenshotDetailsDialog'
    ),
  'ScreenshotDetailsDialog',
);

const openScreenshotDetailsDialog = (screenshot: Screenshot) =>
  openModalDialog(ScreenshotDetailsDialog, {
    resolve: screenshot,
  });

export const TableComponent: FunctionComponent<any> = (props) => {
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
        return <ScreenshotsActions row={row} />;
      },
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      placeholderComponent={<ScreenshotsListPlaceholder />}
      verboseName={translate('Offerings screenshots')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      enableExport={true}
    />
  );
};

const mapPropsToFilter = (props) => {
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

const mapStateToProps = (state: RootState) => ({
  offering: getOffering(state).offering,
});

const mapDispatchToProps = (dispatch) => ({
  openViewScreenshotDialog: (image) =>
    dispatch(openScreenshotDetailsDialog(image)),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  connectTable(TableOptions),
);

export const OfferingScreenshotsList = enhance(TableComponent);
