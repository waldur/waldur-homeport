import { ClockIcon } from '@phosphor-icons/react';

import { Tooltip } from 'waldur-ui';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';

export const EndDateTooltip = ({ end_date }) => {
  if (!end_date) {
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
