import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import {
  Project,
  marketplaceServiceProvidersProjectPermissionsList,
} from 'waldur-js-client';

import { fetchResultCount } from '@/core/api';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { NavItem } from '@/user/affiliations/OrganizationExpandableRow';
import { SummaryTeamTable } from '@/user/affiliations/SummaryTeamTable';

import { TableTabsContainer } from '../../customer/list/TableTabsContainer';

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
      <TableTabsContainer
        defaultActiveKey="team"
        unmountOnExit={true}
        className="min-h-375px"
      >
        <div className="overflow-auto">
          <Nav variant="tabs" className="nav-line-tabs flex-nowrap">
            <NavItem
              title={translate('Team')}
              eventKey="team"
              count={teamCount}
              countLoading={teamCountLoading}
            />
            <NavItem
              title={translate('Metadata')}
              eventKey="metadata"
              count={row.project_metadata?.length}
              countLoading={false}
            />
          </Nav>
        </div>
        <Tab.Content className="overflow-auto">
          <Tab.Pane eventKey="team" unmountOnExit={true}>
            <SummaryTeamTable
              scope={row}
              context="project"
              fetchData={fetchData}
              filter={{ scope_uuid: row.uuid }}
              hideActions
            />
          </Tab.Pane>
          <Tab.Pane eventKey="metadata" unmountOnExit={true}>
            <ProviderProjectMetadataPanel answers={row.project_metadata} />
          </Tab.Pane>
        </Tab.Content>
      </TableTabsContainer>
    </ExpandableContainer>
  );
};
