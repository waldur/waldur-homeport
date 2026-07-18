import { FC, useMemo } from 'react';
import { marketplaceOfferingFilesList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { ExternalLink } from '@/core/ExternalLink';
import { translate } from '@/i18n';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { OfferingSectionProps } from '../types';

import { AddDocumentButton } from './AddDocumentButton';
import { RemoveDocumentAction } from './RemoveDocumentButton';

export const OfferingDocumentsSection: FC<OfferingSectionProps> = ({
  offering,
}) => {
  const filter = useMemo(
    () => ({ offering_uuid: offering.uuid }),
    [offering.uuid],
  );
  const tableProps = useTable({
    table: 'OfferingDocuments',
    filter,
    fetchData: createFetcher(marketplaceOfferingFilesList),
  });

  const columns = [
    {
      title: translate('File name'),
      render: ({ row }) => (
        <ExternalLink url={row.file} label={row.name} iconless />
      ),
    },
    {
      title: translate('Uploaded at'),
      render: ({ row }) => formatDateTime(row.created),
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      title={translate('Documents')}
      verboseName={translate('Documents')}
      tableActions={
        <AddDocumentButton offering={offering} refetch={tableProps.fetch} />
      }
      rowActions={({ row }) => (
        <ActionsDropdown row={row} refetch={tableProps.fetch}>
          <RemoveDocumentAction
            row={row}
            offering={offering}
            refetch={tableProps.fetch}
          />
        </ActionsDropdown>
      )}
    />
  );
};
