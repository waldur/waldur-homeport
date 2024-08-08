import { FunctionComponent, useMemo } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { IMAGES_TABLE_NAME } from '@waldur/marketplace/offerings/store/constants';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { CreateImageButton } from './CreateImageButton';
import { DeleteImageButton } from './DeleteImageButton';
import { ImageThumbnail } from './ImageThumbnail';

export const OfferingImagesList: FunctionComponent<{ offering }> = ({
  offering,
}) => {
  const filter = useMemo(() => {
    if (offering) {
      return { offering_uuid: offering.uuid };
    }
  }, [offering]);
  const tableProps = useTable({
    table: IMAGES_TABLE_NAME,
    fetchData: createFetcher('marketplace-screenshots'),
    filter,
  });
  const columns = [
    {
      title: translate('Thumbnail'),
      render: ({ row }) => <ImageThumbnail image={row} />,
      export: false,
    },
    {
      title: translate('Name'),
      render: ({ row }) => row.name,
      orderField: 'name',
      export: 'name',
    },
    {
      title: translate('Description'),
      render: ({ row }) => row.description,
      export: 'description',
    },
    {
      title: translate('Created'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
      export: (row) => formatDateTime(row.created),
    },
  ];

  return (
    <Table
      {...tableProps}
      title={translate('Images')}
      id="images"
      columns={columns}
      verboseName={translate('Offerings images')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      tableActions={<CreateImageButton offering={offering} />}
      rowActions={DeleteImageButton}
    />
  );
};
