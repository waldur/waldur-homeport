import { Card, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { QuotaCell } from '@waldur/marketplace/resources/QuotaCell';

import { QuickActions } from './QuickActions';

const minutesToHours = (value: number) => Math.ceil(value / 60);

const convertRamToGbH = (value: number) => Math.ceil(value / 1024 / 60);

export const AllocationQuotas = ({ resource }) => (
  <Card.Body>
    <div className="d-flex justify-content-between mb-5">
      <QuickActions resource={resource} />
    </div>
    <Row>
      <QuotaCell
        usage={minutesToHours(resource.cpu_usage)}
        limit={minutesToHours(resource.cpu_limit)}
        units={translate('hours')}
        title={translate('CPU')}
        description={translate('Total CPU hours consumed this month')}
      />
      <QuotaCell
        usage={minutesToHours(resource.gpu_usage)}
        limit={minutesToHours(resource.gpu_limit)}
        units={translate('hours')}
        title={translate('GPU')}
        description={translate('Total GPU hours consumed this month')}
      />
    </Row>
    <Row>
      <QuotaCell
        usage={convertRamToGbH(resource.ram_usage)}
        limit={convertRamToGbH(resource.ram_limit)}
        units={translate('hours')}
        title={translate('RAM')}
        description={translate('Total RAM GB-hours consumed this month')}
      />
    </Row>
  </Card.Body>
);
