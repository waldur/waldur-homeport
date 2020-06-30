import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as PanelBody from 'react-bootstrap/lib/PanelBody';
import * as Row from 'react-bootstrap/lib/Row';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';
import useAsync from 'react-use/lib/useAsync';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

import { AllocationUsageChart } from './AllocationUsageChart';
import { loadCharts } from './api';
import './AllocationUsageTable.scss';

export const AllocationUsageTable = ({ resource }) => {
  const { loading, error, value } = useAsync(() =>
    loadCharts(resource.service_settings, resource.url),
  );
  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>{translate('Unable to load data')}</>
  ) : (
    <Row>
      <Col md={9}>
        <div className="tabs-container">
          <Tabs
            unmountOnExit
            mountOnEnter
            id="allocation-usage"
            animation={false}
          >
            {value.charts.map((chart, index) => (
              <Tab title={chart.name} key={index}>
                <PanelBody>
                  <AllocationUsageChart chart={chart} />
                </PanelBody>
              </Tab>
            ))}
          </Tabs>
        </div>
      </Col>
      <Col md={3}>
        <ul className="list-unstyled">
          {value.users.map((user, index) => (
            <Tooltip id={`user-${index}`} label={user.freeipa_name} key={index}>
              <li>
                <span
                  className="slurm-allocation-usage-table__indicator"
                  style={{ backgroundColor: user.color }}
                />
                {user.full_name || user.freeipa_name}
              </li>
            </Tooltip>
          ))}
        </ul>
      </Col>
    </Row>
  );
};
