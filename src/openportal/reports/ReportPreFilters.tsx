import { Info } from 'luxon';
import { FC, useMemo } from 'react';
import { Form } from 'react-bootstrap';

import { MonthPicker } from 'waldur-ui';

import { translate } from '@/i18n';

export const MAX_USER_MAPPINGS = 100;

export const MONTH_NAMES = Info.months('long');

export const groupByMonth = <T extends { year: number; month: number }>(
  items: T[],
): Record<string, T[]> => {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    const key = `${item.year}-${String(item.month).padStart(2, '0')}`;
    groups[key] = [...(groups[key] ?? []), item];
  }
  return groups;
};

interface ReportPreFiltersProps {
  year: number | undefined;
  month: number | undefined;
  onYearChange: (year: number | undefined) => void;
  onMonthChange: (month: number | undefined) => void;
}

export const ReportPreFilters: FC<ReportPreFiltersProps> = ({
  year,
  month,
  onYearChange,
  onMonthChange,
}) => {
  const value = useMemo(
    () => (year && month ? new Date(year, month - 1, 1) : null),
    [year, month],
  );

  const handleChange = (date: Date | null) => {
    if (date) {
      onYearChange(date.getFullYear());
      onMonthChange(date.getMonth() + 1);
    } else {
      onYearChange(undefined);
      onMonthChange(undefined);
    }
  };

  return (
    <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
      <div>
        <Form.Label className="small mb-1" htmlFor="filterMonth">
          {translate('Month')}
        </Form.Label>
        <MonthPicker
          id="filterMonth"
          value={value}
          onChange={handleChange}
          placeholder={translate('All months')}
        />
      </div>
    </div>
  );
};
