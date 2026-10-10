import { FC, useState, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';

import { Tabs, TabsList, TabsTrigger, TabsContent } from 'waldur-ui';

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

      <Tabs
        mount="active"
        value={activeTab}
        onValueChange={(k) => setActiveTab(k)}
      >
        <TabsList bordered={false} className="mb-6">
          <TabsTrigger value="instances">{translate('Instances')}</TabsTrigger>
          <TabsTrigger value="aggregated">
            {translate('Aggregated')}
          </TabsTrigger>
        </TabsList>

        <>
          <TabsContent value="instances">
            <OpenstackInstancesTable />
          </TabsContent>
          <TabsContent value="aggregated">
            <OpenstackInstancesAggregateView />
          </TabsContent>
        </>
      </Tabs>
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
