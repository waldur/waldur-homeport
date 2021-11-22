import { formatDate } from '@waldur/core/dateUtils';
import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

export const EndDateTooltip = ({ end_date }) => {
  if (!end_date) {
    return null;
  }
  return (
    <>
      {' '}
      <Tooltip
        id="end-date"
        label={translate('Termination date: {date}', {
          date: formatDate(end_date),
        })}
      >
        <i className="fa fa-clock-o" />
      </Tooltip>
    </>
  );
};
