import { useMemo } from 'react';
import {
  marketplacePublicOfferingsList,
  PublicOfferingDetails,
  Tag,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { getLabel } from '@/marketplace/common/registry';
import { OfferingStateField } from '@/marketplace/offerings/OfferingStateField';
import { createFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

const mandatoryFields = [
  'uuid',
  'name',
  'state',
  'customer_name',
  'type',
  'created',
];

interface TagExpandableRowProps {
  row: Tag;
}

export const TagExpandableRow = ({ row }: TagExpandableRowProps) => {
  const filter = useMemo(() => ({ tag: row.uuid }), [row.uuid]);

  const tableProps = useTable({
    table: `TagOfferings-${row.uuid}`,
    filter,
    fetchData: createFetcher(marketplacePublicOfferingsList),
    mandatoryFields,
  });

  return (
    <ExpandableContainer>
      <Table<PublicOfferingDetails>
        {...tableProps}
        columns={[
          {
            title: translate('Name'),
            render: ({ row }) => (
              <Link
                state="public-offering.marketplace-public-offering"
                params={{ uuid: row.uuid }}
              >
                {row.name}
              </Link>
            ),
            id: 'name',
          },
          {
            title: translate('Organization'),
            render: ({ row }) => renderFieldOrDash(row.customer_name),
            id: 'organization',
          },
          {
            title: translate('Type'),
            render: ({ row }) => <>{getLabel(row.type)}</>,
            id: 'type',
          },
          {
            title: translate('State'),
            render: ({ row }) => <OfferingStateField offering={row} />,
            id: 'state',
          },
          {
            title: translate('Created'),
            render: ({ row }) => formatDateTime(row.created),
            id: 'created',
          },
        ]}
        verboseName={translate('offerings')}
        hasActionBar={false}
        minHeight="auto"
      />
    </ExpandableContainer>
  );
};
