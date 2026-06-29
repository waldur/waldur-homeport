import { DateTime } from 'luxon';
import { FC, useCallback, useMemo, useRef, useState } from 'react';
import { FieldRenderProps } from 'react-final-form';

import {
  DateTimeRangeField,
  DateTimeRangeHandle,
} from '@/form/DateTimeRangeField';
import { translate } from '@/i18n';

type WindowValue = [Date, Date] | [Date] | undefined;

interface Chip {
  label: string;
  compute(start?: Date): [Date, Date] | null;
  /** When true, only enabled if the user has already picked a start date. */
  requiresStart?: boolean;
}

const buildBaseChips = (): Chip[] => {
  const tonight: Chip = {
    label: translate('Tonight 22:00 – 02:00'),
    compute: () => {
      const start = DateTime.now().set({
        hour: 22,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
      const end = start.plus({ hours: 4 });
      return [start.toJSDate(), end.toJSDate()];
    },
  };
  const tomorrow: Chip = {
    label: translate('Tomorrow 22:00 – 02:00'),
    compute: () => {
      const start = DateTime.now()
        .plus({ days: 1 })
        .set({ hour: 22, minute: 0, second: 0, millisecond: 0 });
      const end = start.plus({ hours: 4 });
      return [start.toJSDate(), end.toJSDate()];
    },
  };
  const weekend: Chip = {
    label: translate('This weekend (Sat 00:00 – Sun 06:00)'),
    compute: () => {
      const now = DateTime.now();
      // Saturday = ISO weekday 6
      const daysUntilSaturday = (6 - now.weekday + 7) % 7 || 7;
      const start = now
        .plus({ days: daysUntilSaturday })
        .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      const end = start.plus({ days: 1, hours: 6 });
      return [start.toJSDate(), end.toJSDate()];
    },
  };
  const plus1: Chip = {
    label: translate('+1 h from start'),
    requiresStart: true,
    compute: (start) => {
      if (!start) return null;
      const begin = DateTime.fromJSDate(start);
      return [begin.toJSDate(), begin.plus({ hours: 1 }).toJSDate()];
    },
  };
  const plus4: Chip = {
    label: translate('+4 h from start'),
    requiresStart: true,
    compute: (start) => {
      if (!start) return null;
      const begin = DateTime.fromJSDate(start);
      return [begin.toJSDate(), begin.plus({ hours: 4 }).toJSDate()];
    },
  };
  const plus8: Chip = {
    label: translate('+8 h from start'),
    requiresStart: true,
    compute: (start) => {
      if (!start) return null;
      const begin = DateTime.fromJSDate(start);
      return [begin.toJSDate(), begin.plus({ hours: 8 }).toJSDate()];
    },
  };

  return [tonight, tomorrow, weekend, plus1, plus4, plus8];
};

const formatDuration = (start: Date, end: Date): string => {
  const diff = DateTime.fromJSDate(end)
    .diff(DateTime.fromJSDate(start), ['hours', 'minutes'])
    .toObject();
  const hours = Math.max(0, Math.floor(diff.hours ?? 0));
  const minutes = Math.max(0, Math.round(diff.minutes ?? 0));
  return translate('Window: {hours} h {minutes} m', { hours, minutes });
};

export const MaintenanceWindowPicker: FC<FieldRenderProps<WindowValue>> = (
  props,
) => {
  const pickerRef = useRef<DateTimeRangeHandle>(null);
  const [partialStart, setPartialStart] = useState<Date | undefined>(undefined);
  const value = props.input.value;
  const committedStart =
    Array.isArray(value) && value[0] instanceof Date ? value[0] : undefined;
  // Prefer the committed start; fall back to the in-progress one so the
  // "+N h from start" chips light up after the first calendar click.
  const start = committedStart ?? partialStart;
  const hasFullRange =
    Array.isArray(value) &&
    value.length === 2 &&
    value[0] instanceof Date &&
    value[1] instanceof Date;

  const chips = useMemo(() => buildBaseChips(), []);

  const applyChip = useCallback(
    (chip: Chip) => {
      const next = chip.compute(start);
      if (next) {
        props.input.onChange(next);
        setPartialStart(undefined);
      }
    },
    [props.input, start],
  );

  const focusPicker = useCallback(() => {
    pickerRef.current?.open();
  }, []);

  return (
    <div>
      <DateTimeRangeField
        ref={pickerRef}
        input={props.input}
        meta={props.meta}
        onPartialStartChange={setPartialStart}
      />
      <div className="d-flex flex-wrap gap-2 mt-2">
        {chips.map((chip) => {
          const disabled = chip.requiresStart && !start;
          return (
            <button
              key={chip.label}
              type="button"
              className="btn btn-sm btn-light"
              disabled={disabled}
              onClick={() => applyChip(chip)}
            >
              {chip.label}
            </button>
          );
        })}
        <button
          type="button"
          className="btn btn-sm btn-light"
          onClick={focusPicker}
        >
          {translate('Custom…')}
        </button>
      </div>
      {hasFullRange ? (
        <div className="text-muted mt-2">
          {formatDuration(value[0] as Date, value[1] as Date)}
        </div>
      ) : null}
      {props.meta.touched && props.meta.error ? (
        <div className="text-danger mt-2">{props.meta.error}</div>
      ) : null}
    </div>
  );
};
