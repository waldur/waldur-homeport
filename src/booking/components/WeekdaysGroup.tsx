import { Info } from 'luxon';
import { FunctionComponent, useId } from 'react';

import { Tooltip } from 'waldur-ui';

import { range } from '@/core/utils';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';

import { handleWeekDays } from '../utils';

interface WeekdaysGroupProps {
  daysOfWeek: number[];
  setDaysOfWeek(value: number[]): void;
}

/** A round weekday toggle: a visually hidden checkbox, still reachable by keyboard. */
const WeekdayToggle: FunctionComponent<{
  value: number;
  checked: boolean;
  title: string;
  label: string;
  onChange(value: string): void;
}> = ({ value, checked, title, label, onChange }) => {
  const id = useId();
  return (
    <Tooltip label={title}>
      <span>
        <input
          id={id}
          type="checkbox"
          className="peer sr-only"
          value={value}
          checked={checked}
          onChange={(e) => onChange(e.target.value)}
        />
        <label
          htmlFor={id}
          className="m-0 inline-block size-[30px] cursor-pointer rounded-full bg-quaternary text-center text-sm leading-[30px] text-primary peer-checked:bg-[var(--bg-brand-solid)] peer-checked:text-[var(--text-primary-on-brand)] peer-focus-visible:outline-[2px] peer-focus-visible:outline-solid peer-focus-visible:outline-[var(--focus-ring-color)] peer-focus-visible:outline-offset-[2px]"
        >
          {label}
        </label>
      </span>
    </Tooltip>
  );
};

export const WeekdaysGroup: FunctionComponent<WeekdaysGroupProps> = ({
  daysOfWeek,
  setDaysOfWeek,
}) => (
  <FormGroup label={translate('Select available weekdays')}>
    <div className="mx-[20px] mt-[8px] flex justify-between">
      {[6].concat(range(6)).map((day) => {
        // luxon day indexes are Monday: 0 -> Sunday: 6
        // but we are assuming in waldur Sunday: 0 -> Monday: 1 (js date rule)
        const jsDateDay = (day + 1) % 7;
        return (
          <WeekdayToggle
            key={day}
            value={jsDateDay}
            checked={daysOfWeek.includes(jsDateDay)}
            title={Info.weekdays('long')[day]}
            label={Info.weekdays('narrow')[day]}
            onChange={(next) => setDaysOfWeek(handleWeekDays(daysOfWeek, next))}
          />
        );
      })}
    </div>
  </FormGroup>
);
