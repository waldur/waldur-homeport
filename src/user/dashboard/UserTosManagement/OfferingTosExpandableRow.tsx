import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { marketplaceResourcesList } from 'waldur-js-client';

import { fetchResultCount } from '@/core/api';
import { Badge } from '@/core/Badge';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { TableWithTabs } from '@/table/TableWithTabs';
import { TableTab } from '@/table/types';

import { OfferingResourcesTable } from './OfferingResourcesTable';
import { OfferingTosTable } from './OfferingTosTable';

interface OfferingTosExpandableRowProps {
  offering: {
    uuid: string;
    name: string;
  };
  onTosAction?: () => void;
}

export const OfferingTosExpandableRow: FC<OfferingTosExpandableRowProps> = ({
  offering,
  onTosAction,
}) => {
  const resourcesCountQuery = useQuery({
    queryKey: ['offering-resources-count', offering.uuid],
    queryFn: () =>
      marketplaceResourcesList({
        query: { offering_uuid: [offering.uuid], page_size: 1 },
      }).then(fetchResultCount),
    refetchOnWindowFocus: false,
  });

  const tabs = useMemo<TableTab[]>(
    () => [
      {
        key: 'tos',
        title: translate('Terms of Service'),
        component: OfferingTosTable,
      },
      {
        key: 'resources',
        title: (
          <>
            {translate('Resources')}
            <Badge variant="default" pill outline className="ms-2">
              {resourcesCountQuery.isLoading ? (
                <LoadingSpinnerSimple />
              ) : (
                resourcesCountQuery.data || 0
              )}
            </Badge>
          </>
        ),
        component: OfferingResourcesTable,
      },
    ],
    [resourcesCountQuery.data, resourcesCountQuery.isLoading],
  );

  return (
    <ExpandableContainer>
      <TableWithTabs
        title={offering.name}
        tabs={tabs}
        data={{ offering, onTosAction }}
      />
    </ExpandableContainer>
  );
};
