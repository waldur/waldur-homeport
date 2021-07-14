import { useMemo, useState, useEffect, FunctionComponent } from 'react';

import { range } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import {
  cronDayName,
  cronNumeral,
  cronMonthName,
  parseCrontab,
  Frequency,
  serializeCron,
} from '@waldur/resource/crontab';

import './CronField.scss';

const CronSelectField = ({ options, value, onChange }) => {
  return (
    <div className="cron-select-wrap">
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="cron-select"
      >
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const BaseFrequencyField = ({ value, onChange }) => {
  const options = useMemo(
    () => [
      { label: translate('minute'), value: Frequency.MINUTE },
      { label: translate('hour'), value: Frequency.HOUR },
      { label: translate('day'), value: Frequency.DAY },
      { label: translate('week'), value: Frequency.WEEK },
      { label: translate('month'), value: Frequency.MONTH },
      { label: translate('year'), value: Frequency.YEAR },
    ],
    [],
  );

  return (
    <CronSelectField options={options} value={value} onChange={onChange} />
  );
};

const DayField = ({ value, onChange }) => {
  const options = useMemo(
    () =>
      range(7).map((value) => ({
        value,
        label: cronDayName(value),
      })),
    [],
  );
  return (
    <CronSelectField options={options} value={value} onChange={onChange} />
  );
};

const DayOfMonthField = ({ value, onChange }) => {
  const options = useMemo(
    () =>
      range(31).map((value) => ({
        value: value + 1,
        label: cronNumeral(value + 1),
      })),
    [],
  );
  return (
    <CronSelectField options={options} value={value} onChange={onChange} />
  );
};

const MonthField = ({ value, onChange }) => {
  const options = useMemo(
    () =>
      range(12).map((value) => ({
        value: value + 1,
        label: cronMonthName(value + 1),
      })),
    [],
  );
  return (
    <CronSelectField options={options} value={value} onChange={onChange} />
  );
};

const HourField = ({ value, onChange }) => {
  const options = useMemo(
    () =>
      range(24).map((value) => ({
        value,
        label: value,
      })),
    [],
  );
  return (
    <CronSelectField options={options} value={value} onChange={onChange} />
  );
};

const MinuteField = ({ value, onChange }) => {
  const options = useMemo(
    () =>
      range(12).map((value) => ({
        value: value * 5,
        label: value * 5,
      })),
    [],
  );
  return (
    <CronSelectField options={options} value={value} onChange={onChange} />
  );
};

export const CronField: FunctionComponent<any> = (props) => {
  const {
    input: { value, onChange },
  } = props;
  const [parsedValue, setParsedValue] = useState(() => {
    const val = parseCrontab(value);
    val.base = val.base || Frequency.MINUTE;
    return val;
  });

  useEffect(() => {
    onChange(
      serializeCron({
        ...parsedValue,
        base: parsedValue.base,
      }),
    );
  }, [onChange, parsedValue]);

  return (
    <div className="cron-wrap">
      {translate('Every')}:&nbsp;
      <BaseFrequencyField
        value={parsedValue.base}
        onChange={(v) => setParsedValue({ ...parsedValue, base: v })}
      />
      <div className="select-options">
        {parsedValue.base == Frequency.WEEK && (
          <>
            &nbsp;
            {translate('on')}&nbsp;
            <DayField
              value={parsedValue.dayValues}
              onChange={(v) => setParsedValue({ ...parsedValue, dayValues: v })}
            />
          </>
        )}
        {[Frequency.MONTH, Frequency.YEAR].includes(parsedValue.base) && (
          <>
            &nbsp;
            {translate('on the')}&nbsp;
            <DayOfMonthField
              value={parsedValue.dayOfMonthValues}
              onChange={(v) =>
                setParsedValue({ ...parsedValue, dayOfMonthValues: v })
              }
            />
          </>
        )}
        {parsedValue.base == Frequency.YEAR && (
          <>
            &nbsp;
            {translate('of')}&nbsp;
            <MonthField
              value={parsedValue.monthValues}
              onChange={(v) =>
                setParsedValue({ ...parsedValue, monthValues: v })
              }
            />
          </>
        )}
        &nbsp;
        {parsedValue.base != Frequency.MINUTE && translate('at')}&nbsp;
        {[
          Frequency.DAY,
          Frequency.WEEK,
          Frequency.MONTH,
          Frequency.YEAR,
        ].includes(parsedValue.base) && (
          <>
            <HourField
              value={parsedValue.hourValues}
              onChange={(v) =>
                setParsedValue({ ...parsedValue, hourValues: v })
              }
            />
            {' : '}
          </>
        )}
        {parsedValue.base != Frequency.MINUTE && (
          <MinuteField
            value={parsedValue.minuteValues}
            onChange={(v) =>
              setParsedValue({ ...parsedValue, minuteValues: v })
            }
          />
        )}
        &nbsp;
        {parsedValue.base == Frequency.HOUR && translate('past the hour')}
      </div>
    </div>
  );
};
