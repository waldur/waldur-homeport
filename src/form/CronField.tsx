import * as React from 'react';

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
  const options = React.useMemo(
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
  const options = React.useMemo(
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
  const options = React.useMemo(
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
  const options = React.useMemo(
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
  const options = React.useMemo(
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
  const options = React.useMemo(
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

export const CronField = (props) => {
  const {
    input: { value, onChange },
  } = props;
  const [baseValue, setBaseValue] = React.useState(() =>
    value ? parseCrontab(value).base : Frequency.MINUTE,
  );
  const [dayValues, setDayValues] = React.useState();
  const [dayOfMonthValues, setDayOfMonthValues] = React.useState();
  const [monthValues, setMonthValues] = React.useState();
  const [hourValues, setHourValues] = React.useState();
  const [minuteValues, setMinuteValues] = React.useState();

  React.useEffect(() => {
    if (!value) {
      return;
    }
    const crontab = parseCrontab(value);
    setBaseValue(crontab.base);

    if (
      [
        Frequency.HOUR,
        Frequency.DAY,
        Frequency.WEEK,
        Frequency.MONTH,
        Frequency.YEAR,
      ].includes(crontab.base)
    ) {
      setMinuteValues(crontab.minuteValues);
    }

    if (
      [Frequency.DAY, Frequency.WEEK, Frequency.MONTH, Frequency.YEAR].includes(
        crontab.base,
      )
    ) {
      setHourValues(crontab.hourValues);
    }

    if (crontab.base === Frequency.WEEK) {
      setDayValues(crontab.dayValues);
    }

    if ([Frequency.MONTH, Frequency.YEAR].includes(crontab.base)) {
      setDayOfMonthValues(crontab.dayOfMonthValues);
    }

    if (crontab.base === Frequency.YEAR) {
      setMonthValues(crontab.monthValues);
    }
  }, [value]);

  React.useEffect(() => {
    onChange(
      serializeCron({
        base: baseValue,
        dayValues,
        dayOfMonthValues,
        monthValues,
        hourValues,
        minuteValues,
      }),
    );
  }, [
    onChange,
    baseValue,
    dayValues,
    dayOfMonthValues,
    monthValues,
    hourValues,
    minuteValues,
  ]);

  return (
    <div className="cron-wrap">
      {translate('Every')}:&nbsp;
      <BaseFrequencyField value={baseValue} onChange={setBaseValue} />
      <div className="select-options">
        {baseValue == Frequency.WEEK && (
          <>
            &nbsp;
            {translate('on')}&nbsp;
            <DayField value={dayValues} onChange={setDayValues} />
          </>
        )}
        {[Frequency.MONTH, Frequency.YEAR].includes(baseValue) && (
          <>
            &nbsp;
            {translate('on the')}&nbsp;
            <DayOfMonthField
              value={dayOfMonthValues}
              onChange={setDayOfMonthValues}
            />
          </>
        )}
        {baseValue == Frequency.YEAR && (
          <>
            &nbsp;
            {translate('of')}&nbsp;
            <MonthField value={monthValues} onChange={setMonthValues} />
          </>
        )}
        &nbsp;
        {baseValue != Frequency.MINUTE && translate('at')}&nbsp;
        {[
          Frequency.DAY,
          Frequency.WEEK,
          Frequency.MONTH,
          Frequency.YEAR,
        ].includes(baseValue) && (
          <>
            <HourField value={hourValues} onChange={setHourValues} />
            {' : '}
          </>
        )}
        {baseValue != Frequency.MINUTE && (
          <MinuteField value={minuteValues} onChange={setMinuteValues} />
        )}
        &nbsp;
        {baseValue == Frequency.HOUR && translate('past the hour')}
      </div>
    </div>
  );
};
