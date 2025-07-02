import { ClockIcon } from '@phosphor-icons/react';

import { formatDate } from '@waldur/core/dateUtils';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

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
        <ClockIcon />
      </Tip>
    </>
  );
};
