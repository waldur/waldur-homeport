import { Info } from 'luxon';
import { FunctionComponent } from 'react';

import { Tip } from '@waldur/core/Tooltip';
import { range } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { handleWeekDays } from '../utils';

interface WeekdaysGroupProps {
  daysOfWeek: number[];
  setDaysOfWeek(value: number[]): void;
}

export const WeekdaysGroup: FunctionComponent<WeekdaysGroupProps> = ({
  daysOfWeek,
  setDaysOfWeek,
}) => (
  <FormGroup
    label={translate('Select available weekdays')}
    labelClassName="col-sm-3"
    valueClassName={'col-sm-8'}
  >
    <div className="weekDays-selector">
      {range(7).map((day, index) => (
        <Tip
          key={index}
          label={Info.weekdays('long')[day]}
          id={`weekday-${day}`}
        >
          <input
            type="checkbox"
            id={`weekday-${day}`}
            value={day}
            checked={daysOfWeek.includes(day)}
            onChange={(e) =>
              setDaysOfWeek(handleWeekDays(daysOfWeek, e.target.value))
            }
          />
          <label htmlFor={`weekday-${day}`}>
            {Info.weekdays('narrow')[day]}
          </label>
        </Tip>
      ))}
    </div>
  </FormGroup>
);
