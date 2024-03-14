import { useMemo } from 'react';

import { parseDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

export const EndingField = ({ endDate }) => {
  const data = useMemo(() => {
    if (!endDate) return {};
    const endDateParsed = parseDate(endDate);
    const diffNowDays = endDateParsed.diffNow().as('days');
    const textClass = diffNowDays <= 4 ? 'text-danger' : '';
    return {
      text:
        diffNowDays > 0 ? endDateParsed.toRelative() : translate('Has ended'),
      date: endDateParsed.toISODate(),
      textClass,
    };
  }, [endDate]);

  if (!endDate) {
    return <>{DASH_ESCAPE_CODE}</>;
  }
  return (
    <div className={data.textClass}>
      {data.text} ({data.date})
    </div>
  );
};
