import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { IMAGES_TABLE_NAME } from '@waldur/marketplace/offerings/store/constants';
import { Offering } from '@waldur/marketplace/types';
import { connectTable, createFetcher, Table } from '@waldur/table';

import { CreateImageButton } from './CreateImageButton';
import { DeleteImageButton } from './DeleteImageButton';
import { ImagesListPlaceholder } from './ImagesListPlaceholder';
import { ImageThumbnail } from './ImageThumbnail';

const TableComponent: FunctionComponent<any> = (props) => {
  const columns = [
    {
      title: translate('Thumbnail'),
      render: ({ row }) => <ImageThumbnail image={row} />,
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
  ];

  return (
    <Table
      {...props}
      title={translate('Images')}
      columns={columns}
      placeholderComponent={<ImagesListPlaceholder />}
      verboseName={translate('Offerings images')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      actions={<CreateImageButton offering={props.offering} />}
      hoverableRow={DeleteImageButton}
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

export const OfferingImagesList = connectTable(TableOptions)(
  TableComponent,
) as React.ComponentType<any>;
