import type { Meta, StoryObj } from '@storybook/react-vite';
import { ar } from 'date-fns/locale/ar';
import { enUS } from 'date-fns/locale/en-US';
import { et } from 'date-fns/locale/et';
import { fi } from 'date-fns/locale/fi';
import { lv } from 'date-fns/locale/lv';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { expect } from 'storybook/test';

import { Calendar } from './Calendar';
import { visibleCalendars } from './testing';

const meta: Meta<typeof Calendar> = {
  title: 'Forms/Date & time/Calendar',
  component: Calendar,
  parameters: {
    docs: {
      description: {
        component:
          "shadcn's Calendar over react-day-picker, in this design system's " +
          'tokens. The app-level date fields (DateField, DateTimeField, ' +
          'DateTimeRangeField) wrap it in a popup; their behaviour is covered ' +
          'by the DatePicker and DateRangePicker stories next to this one. ' +
          'For the dark theme, use the toolbar.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Calendar>;

const june15 = new Date(2026, 5, 15);

const SingleDemo = () => {
  const [selected, setSelected] = useState<Date | undefined>(june15);
  return (
    <Calendar
      mode="single"
      selected={selected}
      onSelect={setSelected}
      defaultMonth={june15}
      weekStartsOn={1}
    />
  );
};

export const Single: Story = { render: () => <SingleDemo /> };

const RangeDemo = () => {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(2026, 5, 10),
    to: new Date(2026, 5, 18),
  });
  return (
    <Calendar
      mode="range"
      numberOfMonths={2}
      selected={range}
      onSelect={setRange}
      defaultMonth={june15}
      weekStartsOn={1}
    />
  );
};

export const RangeTwoMonths: Story = { render: () => <RangeDemo /> };

/** Weekends and everything outside 5–25 June are unavailable. */
export const DisabledDays: Story = {
  render: () => (
    <Calendar
      mode="single"
      defaultMonth={june15}
      weekStartsOn={1}
      disabled={[
        { before: new Date(2026, 5, 5) },
        { after: new Date(2026, 5, 25) },
        { dayOfWeek: [0, 6] },
      ]}
    />
  ),
};

const weekdayHeaders = (calendar: HTMLElement) =>
  Array.from(calendar.querySelectorAll('.rdp-weekday')).map(
    (th) => th.textContent,
  );

const LOCALES = [
  ['English', enUS],
  ['Estonian', et],
  ['Latvian', lv],
  ['Finnish', fi],
  ['Arabic', ar],
] as const;

/**
 * Weekday headers stay short in every language: "Mon" where that fits,
 * the locale's short or narrow names where "Mon"-style abbreviations run
 * long (Estonian "esmasp.", Latvian "ceturtd.") and would overlap.
 */
export const WeekdayNamesFitInEveryLocale: Story = {
  render: () => (
    <div className="flex flex-wrap gap-[16px]">
      {LOCALES.map(([name, locale]) => (
        <div key={name}>
          <div className="px-[24px] text-[12px] text-[var(--surface-text-muted)]">
            {name}
          </div>
          <Calendar
            mode="single"
            defaultMonth={june15}
            weekStartsOn={1}
            locale={locale}
          />
        </div>
      ))}
    </div>
  ),
  play: async () => {
    const [en, estonian, ...rest] = visibleCalendars();
    await expect(weekdayHeaders(en)).toEqual([
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ]);
    await expect(weekdayHeaders(estonian)).toEqual([
      'E',
      'T',
      'K',
      'N',
      'R',
      'L',
      'P',
    ]);
    for (const calendar of [en, estonian, ...rest]) {
      for (const header of weekdayHeaders(calendar)) {
        await expect([...header].length).toBeLessThanOrEqual(4);
      }
    }
  },
};
