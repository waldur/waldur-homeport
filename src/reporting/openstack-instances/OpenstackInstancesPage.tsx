import { FC, useState, useMemo } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { Form, useFormState } from 'react-final-form';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import {
  selectMarketplaceStatsOpenstackInstancesFilter,
  MarketplaceStatsOpenstackInstancesFilterFormId,
} from '@/table/generated/MarketplaceStatsOpenstackInstancesFilter';

import { ReportingTitle } from '../ReportingTitle';

import { useOpenstackInstancesSummary } from './api';
import { OpenstackInstancesAggregateView } from './OpenstackInstancesAggregateView';
import { OpenstackInstancesSummaryCards } from './OpenstackInstancesSummaryCards';
import { OpenstackInstancesTable } from './OpenstackInstancesTable';

const OpenstackInstancesPageTable: FC = () => {
  const [activeTab, setActiveTab] = useState<string>('instances');
  const { values } = useFormState();

  const filter = useMemo(
    () => selectMarketplaceStatsOpenstackInstancesFilter(values),
    [values],
  );

  const { data: summary, isLoading: summaryLoading } =
    useOpenstackInstancesSummary(filter);

  return (
    <>
      <ReportingTitle reportKey="openstack-instances" />

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

export const OpenstackInstancesPage: FC<any> = (props) => (
  <Form
    id={MarketplaceStatsOpenstackInstancesFilterFormId}
    onSubmit={() => {}}
    subscription={{
      values: true,
    }}
  >
    {() => <OpenstackInstancesPageTable {...props} />}
  </Form>
);
