import { Info } from 'luxon';
import { FC } from 'react';
import { Form } from 'react-bootstrap';

import { range } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

const CURRENT_YEAR = new Date().getFullYear();

export const MAX_USER_MAPPINGS = 100;

const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - 2024 + 1 },
  (_, i) => 2024 + i,
);

const MONTH_OPTIONS = range(12).map((i) => i + 1);

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
  return (
    <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
      <div>
        <Form.Label className="small mb-1" htmlFor="filterYear">
          {translate('Year')}
        </Form.Label>
        <Form.Select
          id="filterYear"
          size="sm"
          style={{ width: 'auto' }}
          value={year ?? ''}
          onChange={(e) =>
            onYearChange(e.target.value ? Number(e.target.value) : undefined)
          }
        >
          <option value="">{translate('All years')}</option>
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Form.Select>
      </div>
      <div>
        <Form.Label className="small mb-1" htmlFor="filterMonth">
          {translate('Month')}
        </Form.Label>
        <Form.Select
          id="filterMonth"
          size="sm"
          style={{ width: 'auto' }}
          value={month ?? ''}
          onChange={(e) =>
            onMonthChange(e.target.value ? Number(e.target.value) : undefined)
          }
        >
          <option value="">{translate('All months')}</option>
          {MONTH_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {MONTH_NAMES[m - 1]}
            </option>
          ))}
        </Form.Select>
      </div>
    </div>
  );
};
