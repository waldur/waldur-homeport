import { CircleIcon } from '@phosphor-icons/react';
import { Col, Row } from 'react-bootstrap';

import { FormField, FormLabel, Tooltip } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
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
    <FormField as={Row} className="col-auto items-center">
      <FormLabel className="col-auto mb-0 py-[10px]">
        {translate('Status')}
      </FormLabel>
      <Col>
        {Array.from({ length: status.length }).map((_, i) => (
          <Tooltip
            key={i}
            label={translate('{agent} - {status}. Last request: {time}', {
              agent: status[i].agent_type,
              status: status[i].status,
              time: formatDateTime(status[i].last_request_timestamp),
            })}
          >
            <CircleIcon
              weight="bold"
              className={getStatusClassName(status[i])}
            />
          </Tooltip>
        ))}
      </Col>
    </FormField>
  );
};
