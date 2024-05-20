import { PlusCircle } from '@phosphor-icons/react';
import { Duration } from 'luxon';
import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import { Button, Card } from 'react-bootstrap';
import { DateTimePickerProps } from 'react-flatpickr';
import { connect } from 'react-redux';
import { Field, formValueSelector, WrappedFieldArrayProps } from 'redux-form';

import { CalendarSettings } from '@waldur/booking/components/CalendarSettings';
import { CustomRangeDatePicker } from '@waldur/booking/deploy/CustomRangeDatePicker';
import { getConfig } from '@waldur/booking/store/selectors';
import { BookingProps } from '@waldur/booking/types';
import { createBooking, getDurationOptions } from '@waldur/booking/utils';
import { parseDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import './OfferingScheduler.scss';

const getSchedules = (state: RootState) =>
  formValueSelector('EditSchedulesDialog')(
    state,
    'schedules',
  ) as BookingProps[];

type StateProps = ReturnType<typeof mapStateToProps>;

type OfferingSchedulerProps = WrappedFieldArrayProps<BookingProps> & StateProps;

const getDurationSlot = (config: StateProps['config']) => {
  return config?.slotDuration || getDurationOptions()[0].value;
};

const getDisabledRangeOfDates = (config: StateProps['config']) => {
  const disabledRanges: DateTimePickerProps['options']['disable'] = [];
  disabledRanges.push(function (date) {
    if (!config.weekends) {
      if (date.getDay() === 0 || date.getDay() === 6) {
        return true;
      }
    }
    return !config.businessHours.daysOfWeek.includes(date.getDay());
  });
  return disabledRanges;
};

const PureOfferingScheduler: FunctionComponent<OfferingSchedulerProps> = (
  props,
) => {
  const addRow = useCallback(() => {
    props.fields.push({} as any);
  }, [props.fields]);

  const durationSlot = useMemo(
    () => Duration.fromISOTime(getDurationSlot(props.config), {}),
    [props.config],
  );

  useEffect(() => {
    if (props.fields?.length === 0) {
      addRow();
    }
  }, [addRow]);

  const parseField = useCallback(
    (v: [Date, Date]) => {
      if (!v) return {};
      const { weekends, slotDuration, businessHours } = props.config;
      return createBooking(
        {
          start: v[0],
          end: v[1],
          allDay: true,
          extendedProps: {
            config: { weekends, slotDuration, businessHours },
            type: 'Availability',
          },
        },
        new Date().getTime().toString(),
      );
    },
    [props.config],
  );

  return (
    <>
      <Card>
        <Card.Header>
          <Card.Title>
            <h3>{translate('Availability')}</h3>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <CalendarSettings />
        </Card.Body>
      </Card>
      <>
        {props.fields.map((schedule, index) => (
          <div key={index} className="mb-6">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label>
                <b>{translate('Period {i}', { i: index + 1 })}:</b>&nbsp;
                {props.fields.get(index).start &&
                  props.fields.get(index).end && (
                    <span>
                      {parseDate(props.fields.get(index).start).toFormat(
                        'dd LLLL yyyy HH:mm',
                      )}
                      &nbsp;{translate('To')}&nbsp;
                      {parseDate(props.fields.get(index).end).toFormat(
                        'dd LLLL yyyy HH:mm',
                      )}
                    </span>
                  )}
              </label>
              <Button
                variant="light"
                className="btn-icon btn-active-light-danger"
                onClick={() => props.fields.remove(index)}
              >
                <i className="fa fa-times fs-4" />
              </Button>
            </div>
            <Field
              name={schedule}
              component={CustomRangeDatePicker}
              options={{
                minDate: 'today',
                disable: getDisabledRangeOfDates(props.config),
                timeStep: durationSlot ? durationSlot.as('minutes') : 60,
              }}
              parse={parseField}
              format={(schedule) =>
                schedule.start ? [schedule.start, schedule.end] : []
              }
            />
          </div>
        ))}
        <Button variant="light" className="text-nowrap" onClick={addRow}>
          <span className="svg-icon svg-icon-2">
            <PlusCircle />
          </span>
          {translate('Add time period')}
        </Button>
      </>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  schedules: getSchedules(state),
  config: getConfig(state),
});

const enhance = connect(mapStateToProps);

export const OfferingScheduler = enhance(
  PureOfferingScheduler,
) as React.ComponentType<any>;
