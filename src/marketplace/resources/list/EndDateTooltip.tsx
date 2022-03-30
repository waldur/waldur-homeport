import { ENV } from '@waldur/configs/default';
import { formatDate } from '@waldur/core/dateUtils';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

export const EndDateTooltip = ({ end_date }) => {
  if (!end_date) {
    return null;
  }
  if (!ENV.plugins.WALDUR_MARKETPLACE.ENABLE_RESOURCE_END_DATE) {
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
        <i className="fa fa-clock-o" />
      </Tip>
    </>
  );
};
