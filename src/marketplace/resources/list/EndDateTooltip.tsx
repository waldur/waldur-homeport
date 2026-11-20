import { ClockIcon } from '@phosphor-icons/react';

import { HelpIcon } from 'waldur-ui';

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
      <HelpIcon
        label={translate('Termination date: {date}', {
          date: formatDate(end_date),
        })}
        aria-label={translate('Termination date')}
        icon={ClockIcon}
        size="1em"
        className="text-inherit"
      />
    </>
  );
};
