import { Info } from 'luxon';
import { FunctionComponent } from 'react';

import { Tip } from '@/core/Tooltip';
import { range } from '@/core/utils';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';

import { handleWeekDays } from '../utils';

interface WeekdaysGroupProps {
  daysOfWeek: number[];
  setDaysOfWeek(value: number[]): void;
}

export const WeekdaysGroup: FunctionComponent<WeekdaysGroupProps> = ({
  daysOfWeek,
  setDaysOfWeek,
}) => (
  <FormGroup label={translate('Select available weekdays')}>
    <div className="weekDays-selector">
      {[6].concat(range(6)).map((day, index) => {
        // luxon day indexes are Monday: 0 -> Sunday: 6
        // but we are assuming in waldur Sunday: 0 -> Monday: 1 (js date rule)
        const jsDateDay = (day + 1) % 7;
        return (
          <Tip
            key={index}
            label={Info.weekdays('long')[day]}
            id={`weekday-${jsDateDay}`}
          >
            <input
              type="checkbox"
              id={`weekday-${jsDateDay}`}
              value={jsDateDay}
              checked={daysOfWeek.includes(jsDateDay)}
              onChange={(e) =>
                setDaysOfWeek(handleWeekDays(daysOfWeek, e.target.value))
              }
            />

            <label htmlFor={`weekday-${jsDateDay}`}>
              {Info.weekdays('narrow')[day]}
            </label>
          </Tip>
        );
      })}
    </div>
  </FormGroup>
);
