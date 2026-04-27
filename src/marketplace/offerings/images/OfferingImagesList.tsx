import { FunctionComponent, useMemo } from 'react';
import { marketplaceScreenshotsList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { IMAGES_TABLE_NAME } from '@/marketplace/offerings/store/constants';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { CreateImageButton } from './CreateImageButton';
import { DeleteImageAction } from './DeleteImageButton';
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
    fetchData: createFetcher(marketplaceScreenshotsList),
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
      copyField: (row) => row.name,
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
      tableActions={
        <CreateImageButton offering={offering} refetch={tableProps.fetch} />
      }
      rowActions={({ row, fetch }) => (
        <ActionsDropdown row={row} refetch={fetch} data={{ offering }}>
          <DeleteImageAction row={row} refetch={fetch} offering={offering} />
        </ActionsDropdown>
      )}
    />
  );
};
