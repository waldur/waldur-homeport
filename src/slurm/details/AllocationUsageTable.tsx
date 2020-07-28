import * as React from 'react';
import * as PanelBody from 'react-bootstrap/lib/PanelBody';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';
import useAsync from 'react-use/lib/useAsync';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { AllocationUsageChart } from './AllocationUsageChart';
import { loadCharts } from './api';
import './AllocationUsageTable.scss';

export const AllocationUsageTable = ({ resource }) => {
  const { loading, error, value } = useAsync(() => loadCharts(resource.url));

  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>{translate('Unable to load data')}</>
  ) : (
    <div className="tabs-container">
      <Tabs
        defaultActiveKey="tab-0"
        id="allocation-usage-tabs"
        unmountOnExit
        mountOnEnter
        animation
      >
        {value.charts.map((chart, index) => (
          <Tab title={chart.name} key={index} eventKey={`tab-${index}`}>
            <PanelBody>
              <AllocationUsageChart
                chart={chart}
                usages={value.usages}
                userUsages={value.userUsages}
              />
            </PanelBody>
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};
