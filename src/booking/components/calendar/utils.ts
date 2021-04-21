import moment from 'moment-timezone';

const isWeekend = (day): boolean => [6, 7].includes(day.isoWeekday());

const isMonday = (day): boolean => day.isoWeekday() === 1;

const isFriday = (day): boolean => day.isoWeekday() === 5;

export const getNumberOfWeekendsInTheEvent = (event): number => {
  const mStart = moment(event.start);
  const mEnd = moment(event.end);
  return mEnd.diff(mStart, 'weeks');
};

export const removeWeekends = (eventToSplit) => {
  const numberOfSaturdays = getNumberOfWeekendsInTheEvent(eventToSplit);
  const events = [];
  let mStart = moment(eventToSplit.start);
  const mEnd = moment(eventToSplit.end);

  for (let i = 0; i <= numberOfSaturdays; i++) {
    let tempStart = null;
    let tempEnd = null;

    while (mStart.diff(mEnd, 'd')) {
      const currentDate = mStart;
      if (!isWeekend(currentDate)) {
        if (
          moment(currentDate.toDate()).isSame(eventToSplit.start, 'day') ||
          isMonday(currentDate)
        ) {
          tempStart = currentDate.toDate();
        }
        if (
          moment(currentDate.toDate())
            .add(1, 'd')
            .isSame(eventToSplit.end, 'day') ||
          isFriday(currentDate)
        ) {
          tempEnd = moment(currentDate.toDate()).add(1, 'd').toDate();
        }
      }

      if (tempStart && tempEnd) {
        mStart = moment(tempEnd);
        break;
      } else {
        mStart.add(1, 'd');
      }
    }

    events.push({
      ...eventToSplit,
      id: eventToSplit.id + '.' + i,
      start: tempStart,
      end: tempEnd,
    });
  }
  return events;
};
