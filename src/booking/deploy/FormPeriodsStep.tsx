import { Plus } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { uniqueId } from 'lodash';
import { DateTime, Duration } from 'luxon';
import { useCallback, useEffect, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { Field, FieldArray } from 'redux-form';

import { parseDate } from '@waldur/core/dateUtils';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { FormStepProps } from '@waldur/marketplace/deploy/types';

import { getOfferingBookedItems } from '../api';
import { BookingProps } from '../types';
import {
  createAvailabilitySlots,
  getBookedSlots,
  getDurationOptions,
} from '../utils';

import { CustomRangeDatePicker } from './CustomRangeDatePicker';

const getDurationSlot = (schedules: BookingProps[] = []) => {
  const configWithEvent = schedules.find(({ extendedProps }) => {
    if (extendedProps.type === 'Availability' && extendedProps.config) {
      return extendedProps.config;
    }
  });
  return (
    configWithEvent?.extendedProps?.config?.slotDuration ||
    getDurationOptions()[0].value
  );
};

const getAvailableRangeOfDates = (
  schedules: BookingProps[],
  inUseRanges: any[],
) => {
  const availableRanges: Array<{ from: DateTime; to: DateTime }> = [];

  const durationSlot = Duration.fromISOTime(getDurationSlot(schedules), {});

  const slots = createAvailabilitySlots(schedules, durationSlot);

  slots.forEach((slot) => {
    const slotStart = parseDate(slot.start);
    const isBusy = inUseRanges.some((used) => {
      if (!used?.start) return false;
      const usedStart = parseDate(used.start);
      const usedEnd = parseDate(used.end);
      return (
        slotStart.equals(usedStart) ||
        (slotStart > usedStart && slotStart < usedEnd)
      );
    });
    if (!isBusy) {
      const existRange = availableRanges.find((range) =>
        range.to.equals(slotStart),
      );
      if (existRange) {
        existRange.to = existRange.to.plus(durationSlot);
      } else {
        availableRanges.push({
          from: slotStart,
          to: parseDate(slot.end),
        });
      }
    }
  });
  return availableRanges.map((range) => ({
    from: range.from.toISO(),
    to: range.to.toISO(),
  }));
};

const renderScheduleRows = ({
  fields,
  availableSchedules,
  bookedItems,
}: any) => {
  const addRow = useCallback(() => {
    fields.push({});
  }, [fields]);

  const durationSlot = useMemo(
    () => Duration.fromISOTime(getDurationSlot(availableSchedules), {}),
    [availableSchedules],
  );

  useEffect(() => {
    if (fields?.length === 0) {
      addRow();
    }
  }, [addRow]);

  return (
    <>
      {fields.map((schedule, index) => (
        <div key={index} className="mb-6">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label>
              <b>{translate('Period {i}', { i: index + 1 })}:</b>&nbsp;
              {fields.get(index).start && fields.get(index).end && (
                <span>
                  {DateTime.fromJSDate(fields.get(index).start).toFormat(
                    'dd LLLL yyyy HH:mm',
                  )}
                  &nbsp;{translate('To')}&nbsp;
                  {DateTime.fromJSDate(fields.get(index).end).toFormat(
                    'dd LLLL yyyy HH:mm',
                  )}
                </span>
              )}
            </label>
            <Button
              variant="light"
              className="btn-icon btn-active-light-danger"
              onClick={() => fields.remove(index)}
            >
              <i className="fa fa-times fs-4" />
            </Button>
          </div>
          <Field
            name={schedule}
            component={CustomRangeDatePicker}
            options={{
              minDate: 'today',
              enable: getAvailableRangeOfDates(availableSchedules, [
                ...fields.reduce(
                  (acc, _, i) =>
                    fields.get(i) === fields.get(index)
                      ? acc
                      : acc.concat(fields.get(i)),
                  [],
                ),
                ...getBookedSlots(bookedItems),
              ]),
              timeStep: durationSlot ? durationSlot.as('minutes') : 60,
              hasTimePicker: true,
            }}
            parse={(v: [Date, Date]) =>
              v
                ? {
                    id: uniqueId(),
                    start: v[0],
                    end: v[1],
                  }
                : {}
            }
            format={(schedule) =>
              schedule.start ? [schedule.start, schedule.end] : []
            }
          />
        </div>
      ))}
      <Button variant="light" className="text-nowrap" onClick={addRow}>
        <span className="svg-icon svg-icon-2">
          <Plus />
        </span>
        {translate('Add time period')}
      </Button>
    </>
  );
};

export const FormPeriodsStep = (props: FormStepProps) => {
  const { isLoading, data: bookedItems } = useQuery(
    ['bookedItems', props.offering.uuid],
    () => getOfferingBookedItems(props.offering.uuid),
    { staleTime: 3 * 60 * 1000 },
  );

  return (
    <VStepperFormStepCard
      title={translate('Periods')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      loading={isLoading}
      disabled={props.disabled}
      required={props.required}
    >
      <FieldArray
        name="attributes.schedules"
        component={renderScheduleRows}
        rerenderOnEveryChange
        availableSchedules={props.offering.attributes.schedules || []}
        bookedItems={bookedItems}
      />
    </VStepperFormStepCard>
  );
};
