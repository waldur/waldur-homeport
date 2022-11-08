import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { IMAGES_TABLE_NAME } from '@waldur/marketplace/offerings/store/constants';
import { getOffering } from '@waldur/marketplace/offerings/store/selectors';
import { Offering, Image } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';
import { RootState } from '@waldur/store/reducers';
import { connectTable, createFetcher, Table } from '@waldur/table';

import { ImagesActions } from './ImagesActions';
import { ImagesListPlaceholder } from './ImagesListPlaceholder';
import { ImageThumbnail } from './ImageThumbnail';

const ImageDetailsDialog = lazyComponent(
  () => import('./ImageDetailsDialog'),
  'ImageDetailsDialog',
);

const openImageDetailsDialog = (image: Image) =>
  openModalDialog(ImageDetailsDialog, {
    resolve: image,
  });

export const TableComponent: FunctionComponent<any> = (props) => {
  const columns = [
    {
      title: translate('Thumbnail'),
      render: ({ row }) => (
        <ImageThumbnail
          image={row}
          onClick={() => props.openViewImageDialog(row)}
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
        return <ImagesActions row={row} />;
      },
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      placeholderComponent={<ImagesListPlaceholder />}
      verboseName={translate('Offerings images')}
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
  table: IMAGES_TABLE_NAME,
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
  openViewImageDialog: (image) => dispatch(openImageDetailsDialog(image)),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  connectTable(TableOptions),
);

export const OfferingImagesList = enhance(TableComponent);
