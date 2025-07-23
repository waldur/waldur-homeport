import { LockIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';

import { Badge } from '@waldur/core/Badge';
import { parseDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

export const EndingField = ({
  endDate,
  dateFirst = false,
  hasFixedDuration = false,
}) => {
  const data = useMemo(() => {
    if (!endDate) return {};
    const endDateParsed = parseDate(endDate);
    const diffNowDays = endDateParsed.diffNow().as('days');
    const textClass = diffNowDays <= 4 ? 'text-danger' : '';
    return {
      text:
        diffNowDays > 0 ? endDateParsed.toRelative() : translate('Has ended'),
      date: dateFirst
        ? endDateParsed.toFormat('DDD')
        : endDateParsed.toISODate(),
      textClass,
    };
  }, [endDate]);

  if (!endDate) {
    return <>{DASH_ESCAPE_CODE}</>;
  }
  return (
    <div className={data.textClass}>
      {dateFirst ? (
        <>
          {data.date} ({data.text})
        </>
      ) : (
        <>
          {data.text} ({data.date})
        </>
      )}
      {hasFixedDuration && (
        <>
          &nbsp;
          <Badge
            variant="blue"
            outline
            pill
            onlyIcon
            size="sm"
            tooltip={translate('Fixed duration')}
            className="w-20px h-20px p-1"
          >
            <LockIcon weight="bold" size={12} />
          </Badge>
        </>
      )}
    </div>
  );
};
