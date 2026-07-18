import { FC, useMemo } from 'react';
import { marketplaceOfferingFilesList, Offering } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { ExternalLink } from '@/core/ExternalLink';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

interface PublicOfferingDocumentsTableProps {
  offering: Offering;
}

export const PublicOfferingDocumentsTable: FC<
  PublicOfferingDocumentsTableProps
> = ({ offering }) => {
  const filter = useMemo(
    () => ({ offering_uuid: offering.uuid }),
    [offering.uuid],
  );
  const tableProps = useTable({
    table: 'PublicOfferingDocuments',
    filter,
    fetchData: createFetcher(marketplaceOfferingFilesList),
  });

  return (
    <Table
      {...tableProps}
      columns={[
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
      ]}
      title={translate('Documents')}
      verboseName={translate('Documents')}
      hideRefresh
    />
  );
};
