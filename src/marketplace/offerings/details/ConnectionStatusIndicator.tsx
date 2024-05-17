import { Col, FormGroup, FormLabel, Row } from 'react-bootstrap';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

export const ConnectionStatusIndicator = ({ status }) => {
  const getStatusClassName = (integrationStatus) => {
    switch (integrationStatus.status) {
      case 'Active':
        return 'fa fa-circle text-success';
      case 'Disconnected':
        return 'fa fa-circle text-danger';
      case 'Unknown':
        return 'fa fa-circle text-secondary';
      default:
        return 'fa fa-circle text-secondary';
    }
  };

  return (
    <FormGroup as={Row} className="col-auto align-items-center">
      <FormLabel column xs="auto">
        {translate('Status')}
      </FormLabel>
      <Col>
        {Array.from(new Array(status.length)).map((_, i) => (
          <Tip
            key={i}
            id="backend-id"
            label={translate('{agent} - {status}. Last request: {time}', {
              agent: status[i].agent_type,
              status: status[i].status,
              time: formatDateTime(status[i].last_request_timestamp),
            })}
          >
            <i
              className={getStatusClassName(status[i])}
              key={i}
              data-toggle="tooltip"
              data-placement="top"
            />
          </Tip>
        ))}
      </Col>
    </FormGroup>
  );
};
