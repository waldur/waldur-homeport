import { PlusIcon, XIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { uniqueId } from 'lodash-es';
import { DateTime, Duration } from 'luxon';
import { useCallback, useEffect, useMemo } from 'react';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { marketplaceBookingsList } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { UI_STALE_TIME } from '@/core/constants';
import { translate } from '@/i18n';
import { FormStepProps } from '@/marketplace/deploy/types';
import { VStepperFormStepCard } from '@/wizard';

import { BookingProps } from '../types';
import {
  getAvailableRangeOfDates,
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
              {fields.value[index]?.start && fields.value[index]?.end && (
                <span>
                  {DateTime.fromJSDate(fields.value[index].start).toFormat(
                    'dd LLLL yyyy HH:mm',
                  )}
                  &nbsp;{translate('To')}&nbsp;
                  {DateTime.fromJSDate(fields.value[index].end).toFormat(
                    'dd LLLL yyyy HH:mm',
                  )}
                </span>
              )}
            </label>
            <BaseButton
              variant="text-danger"
              onClick={() => fields.remove(index)}
              iconNode={<XIcon weight="bold" />}
              size="lg"
            />
          </div>
          <Field
            name={schedule}
            parse={(v: [Date, Date]) =>
              v
                ? {
                    id: uniqueId(),
                    start: v[0],
                    end: v[1],
                  }
                : {}
            }
            format={(val) => (val?.start ? [val.start, val.end] : [])}
          >
            {(fieldProps) => (
              <CustomRangeDatePicker
                {...fieldProps}
                options={{
                  minDate: 'today',
                  enable: getAvailableRangeOfDates(availableSchedules, [
                    ...(fields.value || []).reduce(
                      (acc, val, i) => (i === index ? acc : acc.concat(val)),
                      [],
                    ),
                    ...getBookedSlots(bookedItems),
                  ]),
                  timeStep: durationSlot ? durationSlot.as('minutes') : 60,
                  hasTimePicker: true,
                }}
              />
            )}
          </Field>
        </div>
      ))}
      <BaseButton
        variant="text-primary"
        className="text-nowrap"
        onClick={addRow}
        iconNode={<PlusIcon weight="bold" />}
        label={translate('Add time period')}
        size="lg"
      />
    </>
  );
};

export const FormPeriodsStep = (props: FormStepProps) => {
  const { isLoading, data: bookedItems } = useQuery({
    queryKey: ['bookedItems', props.offering.uuid],

    queryFn: () =>
      marketplaceBookingsList({ path: { uuid: props.offering.uuid } }).then(
        (r) => r.data,
      ),

    staleTime: UI_STALE_TIME,
  });

  return (
    <VStepperFormStepCard
      title={translate('Periods')}
      id={props.id}
      loading={isLoading}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
    >
      <FieldArray
        name="attributes.schedules"
        component={renderScheduleRows}
        rerenderOnEveryChange
        availableSchedules={props.offering.attributes['schedules'] || []}
        bookedItems={bookedItems}
      />
    </VStepperFormStepCard>
  );
};
