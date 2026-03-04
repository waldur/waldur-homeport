import { FC, useState } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { selectMarketplaceStatsOpenstackInstancesFilter } from '@waldur/table/generated/MarketplaceStatsOpenstackInstancesFilter';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { useOpenstackInstancesSummary } from './api';
import { OpenstackInstancesAggregateView } from './OpenstackInstancesAggregateView';
import { OpenstackInstancesSummaryCards } from './OpenstackInstancesSummaryCards';
import { OpenstackInstancesTable } from './OpenstackInstancesTable';

export const OpenstackInstancesPage: FC = () => {
  useTitle(translate('OpenStack instances'));
  useReportBreadcrumbs({
    category: 'provider',
    currentReport: 'openstack-instances',
  });

  const [activeTab, setActiveTab] = useState<string>('instances');
  const filter = useSelector(selectMarketplaceStatsOpenstackInstancesFilter);
  const { data: summary, isLoading: summaryLoading } =
    useOpenstackInstancesSummary(filter);

  return (
    <>
      {summaryLoading ? (
        <LoadingSpinner />
      ) : (
        summary && <OpenstackInstancesSummaryCards summary={summary} />
      )}

      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Nav variant="tabs" className="nav-line-tabs flex-nowrap mb-6 border-0">
          <Nav.Item>
            <Nav.Link as="button" eventKey="instances">
              {translate('Instances')}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as="button" eventKey="aggregated">
              {translate('Aggregated')}
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="instances" mountOnEnter unmountOnExit>
            <OpenstackInstancesTable />
          </Tab.Pane>
          <Tab.Pane eventKey="aggregated" mountOnEnter unmountOnExit>
            <OpenstackInstancesAggregateView />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </>
  );
};
