import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  Project,
  marketplaceServiceProvidersProjectPermissionsList,
} from 'waldur-js-client';

import { fetchResultCount } from '@/core/api';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { EmbeddedTabs } from '@/table/EmbeddedTabs';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { SummaryTeamTable } from '@/user/affiliations/SummaryTeamTable';

import { ProviderProjectMetadataPanel } from './ProviderProjectMetadataPanel';

interface OwnProps {
  row: Project;
  providerUuid: string;
}

export const ProviderProjectExpandableRow: FC<OwnProps> = ({
  row,
  providerUuid,
}) => {
  const fetchData = useMemo(
    () =>
      createFetcher(marketplaceServiceProvidersProjectPermissionsList, {
        path: { service_provider_uuid: providerUuid },
      }),
    [providerUuid],
  );

  const { data: teamCount, isLoading: teamCountLoading } = useQuery({
    queryKey: ['providerProjectTeamCount', providerUuid, row.uuid],
    queryFn: () =>
      marketplaceServiceProvidersProjectPermissionsList({
        path: { service_provider_uuid: providerUuid },
        query: { scope_uuid: row.uuid, page_size: 1 },
      }).then(fetchResultCount),
  });

  return (
    <ExpandableContainer>
      <EmbeddedTabs
        framed
        defaultValue="team"
        className="min-h-375px"
        tabs={[
          {
            key: 'team',
            title: translate('Team'),
            count: teamCount,
            countLoading: teamCountLoading,
            content: (
              <SummaryTeamTable
                scope={row}
                context="project"
                fetchData={fetchData}
                filter={{ scope_uuid: row.uuid }}
                hideActions
              />
            ),
          },
          {
            key: 'metadata',
            title: translate('Metadata'),
            count: row.project_metadata?.length ?? 0,
            content: (
              <ProviderProjectMetadataPanel answers={row.project_metadata} />
            ),
          },
        ]}
      />
    </ExpandableContainer>
  );
};
