import { ClockIcon } from '@phosphor-icons/react';

import { Tooltip } from 'waldur-ui';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { isResourceTerminal } from '@/marketplace/resources/details/ResourceFlags';

export const EndDateTooltip = ({
  end_date,
  state,
}: {
  end_date?: string | null;
  state?: string;
}) => {
  if (!end_date || isResourceTerminal(state)) {
    return null;
  }
  return (
    <>
      {' '}
      <Tooltip
        label={translate('Termination date: {date}', {
          date: formatDate(end_date),
        })}
      >
        <ClockIcon weight="bold" />
      </Tooltip>
    </>
  );
};
