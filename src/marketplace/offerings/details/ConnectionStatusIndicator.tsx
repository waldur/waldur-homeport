import { CircleIcon } from '@phosphor-icons/react';

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
    <FormField className="flex flex-none flex-wrap items-center gap-x-5">
      <FormLabel className="flex-none mb-0 py-[10px]">
        {translate('Status')}
      </FormLabel>
      <div className="flex-1 min-w-0">
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
      </div>
    </FormField>
  );
};
