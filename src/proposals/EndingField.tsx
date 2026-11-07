import { LockIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';

import { Badge } from 'waldur-ui';

import { parseDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';

import { continuouslyOpenLabel } from './roundCutoff';

export const EndingField = ({
  endDate,
  dateFirst = false,
  hasFixedDuration = false,
  openEnded = false,
}: {
  endDate?: string | null;
  dateFirst?: boolean;
  hasFixedDuration?: boolean;
  /** A round without a cut-off: no end, open until closed. */
  openEnded?: boolean;
}) => {
  const data = useMemo(() => {
    if (!endDate) return {};
    const endDateParsed = parseDate(endDate);
    const diffNowDays = endDateParsed.diffNow().as('days');
    return {
      text:
        diffNowDays > 0 ? endDateParsed.toRelative() : translate('Has ended'),
      date: dateFirst
        ? endDateParsed.toFormat('DDD')
        : endDateParsed.toISODate(),
    };
  }, [endDate]);

  if (!endDate) {
    return <>{openEnded ? continuouslyOpenLabel() : DASH_ESCAPE_CODE}</>;
  }
  return (
    // Plain text, however near: the app does not colour a date red.
    <div>
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
            size="sm"
            shape="pill"
            tone="outline"
            onlyIcon
            tooltip={translate('Fixed duration')}
          >
            <LockIcon weight="bold" size={12} />
          </Badge>
        </>
      )}
    </div>
  );
};
