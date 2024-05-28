import { FunctionComponent, useMemo } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { IMAGES_TABLE_NAME } from '@waldur/marketplace/offerings/store/constants';
import { Offering } from '@waldur/marketplace/types';
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
    exportRow: (row: Offering) => [
      row.name,
      row.description,
      formatDateTime(row.created),
    ],
    exportFields: ['Name', 'Description', 'Created'],
  });
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
      {...tableProps}
      title={translate('Images')}
      id="images"
      columns={columns}
      verboseName={translate('Offerings images')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      actions={<CreateImageButton offering={offering} />}
      hoverableRow={DeleteImageButton}
    />
  );
};
