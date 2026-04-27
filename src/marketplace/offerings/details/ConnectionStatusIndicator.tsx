import { CircleIcon } from '@phosphor-icons/react';
import { Col, FormGroup, FormLabel, Row } from 'react-bootstrap';

import { formatDateTime } from '@/core/dateUtils';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';

export const ConnectionStatusIndicator = ({ status }) => {
  const getStatusClassName = (integrationStatus) => {
    switch (integrationStatus.status) {
      case 'Active':
        return 'text-success';
      case 'Disconnected':
        return 'text-danger';
      case 'Unknown':
        return 'text-secondary';
      default:
        return 'text-secondary';
    }
  };

  return (
    <FormGroup as={Row} className="col-auto align-items-center">
      <FormLabel column xs="auto">
        {translate('Status')}
      </FormLabel>
      <Col>
        {Array.from({ length: status.length }).map((_, i) => (
          <Tip
            key={i}
            id="backend-id"
            label={translate('{agent} - {status}. Last request: {time}', {
              agent: status[i].agent_type,
              status: status[i].status,
              time: formatDateTime(status[i].last_request_timestamp),
            })}
          >
            <CircleIcon
              className={getStatusClassName(status[i])}
              weight="bold"
            />
          </Tip>
        ))}
      </Col>
    </FormGroup>
  );
};
