import { FunctionComponent } from 'react';
import { Card, Tab, Tabs } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { EChart } from '@waldur/core/EChart';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { loadCharts } from './utils';

import './AllocationUsageTable.scss';

export const AllocationUsageTable: FunctionComponent<{ resource }> = ({
  resource,
}) => {
  const {
    loading,
    error,
    value: charts,
  } = useAsync(() =>
    loadCharts(resource.url, resource.marketplace_resource_uuid),
  );

  return loading ? (
    <LoadingSpinner />
  ) : error || !charts ? (
    <>{translate('Unable to load data')}</>
  ) : (
    <div className="tabs-container">
      <Tabs
        defaultActiveKey="tab-0"
        id="allocation-usage-tabs"
        unmountOnExit
        mountOnEnter
      >
        {charts.map((chart, index) => (
          <Tab title={chart.name} key={index} eventKey={`tab-${index}`}>
            <Card.Body>
              <EChart options={chart.options} height="350px" />
            </Card.Body>
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};
