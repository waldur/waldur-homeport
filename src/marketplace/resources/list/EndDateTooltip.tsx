import { ClockIcon } from '@phosphor-icons/react';

import { formatDate } from '@/core/dateUtils';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';

export const EndDateTooltip = ({ end_date }) => {
  if (!end_date) {
    return null;
  }
  return (
    <>
      {' '}
      <Tip
        id="end-date"
        label={translate('Termination date: {date}', {
          date: formatDate(end_date),
        })}
      >
        <ClockIcon weight="bold" />
      </Tip>
    </>
  );
};
