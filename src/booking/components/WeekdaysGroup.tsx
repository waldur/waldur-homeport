import moment from 'moment-timezone';
import { FunctionComponent } from 'react';

import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

const daysArray = [1, 2, 3, 4, 5, 6, 0];
const getDayLabel = (day: number): string => moment.weekdays(day);
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
    labelClassName="control-label col-sm-3"
    valueClassName={'col-sm-8'}
  >
    <div className="weekDays-selector">
      {daysArray.map((day, index) => (
        <Tooltip key={index} label={getDayLabel(day)} id={`weekday-${day}`}>
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
            {getDayLabel(day)[0].toUpperCase()}
          </label>
        </Tooltip>
      ))}
    </div>
  </FormGroup>
);
