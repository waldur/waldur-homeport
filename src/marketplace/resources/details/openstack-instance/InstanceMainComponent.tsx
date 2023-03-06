import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { MonitoringCharts } from '../MonitoringCharts';

import { InstanceDetails } from './InstanceDetails';

export const InstanceMainComponent = ({ resource }) => (
  <>
    {resource.scope ? (
      <div className="mb-10">
        <Card>
          <Card.Header>
            <Card.Title>
              <h3>{translate('Cloud components')}</h3>
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <InstanceDetails resource={resource} />
          </Card.Body>
        </Card>
      </div>
    ) : null}
    {isExperimentalUiComponentsVisible() ? <MonitoringCharts /> : null}
  </>
);
