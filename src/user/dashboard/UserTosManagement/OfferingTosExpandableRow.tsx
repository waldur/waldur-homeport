import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { marketplaceResourcesList } from 'waldur-js-client';

import { fetchResultCount } from '@/core/api';
import { translate } from '@/i18n';
import { EmbeddedTabs } from '@/table/EmbeddedTabs';
import { ExpandableContainer } from '@/table/ExpandableContainer';

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

  return (
    <ExpandableContainer>
      <EmbeddedTabs
        framed
        defaultValue="tos"
        keepTallest
        tabs={[
          {
            key: 'tos',
            title: translate('Terms of Service'),
            content: (
              <OfferingTosTable offering={offering} onTosAction={onTosAction} />
            ),
          },
          {
            key: 'resources',
            title: translate('Resources'),
            count: resourcesCountQuery.data ?? 0,
            countLoading: resourcesCountQuery.isLoading,
            content: <OfferingResourcesTable offering={offering} />,
          },
        ]}
      />
    </ExpandableContainer>
  );
};
