import classNames from 'classnames';
import { DateTime } from 'luxon';
import { useCallback, useMemo } from 'react';

import { Badge, BaseButton } from 'waldur-ui';

import { bookingStateAliases } from '@/booking/BookingStateField';
import { BookingResource, EventInput } from '@/booking/types';
import { parseDate } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const ONE_HOUR_HEIGHT = 40; // 40px
const ONE_MINUTE_HEIGHT = ONE_HOUR_HEIGHT / 60;

const BookingResourceDetailsDialog = lazyComponent(() =>
  import('@/booking/components/BookingResourceDetailsDialog').then(
    (module) => ({ default: module.BookingResourceDetailsDialog }),
  ),
);

interface ItemLayout {
  style: {
    top: string;
    height: string;
  };
  multipart: boolean;
  position: 'first' | 'middle' | 'last';
  schedule: EventInput;
  date: DateTime;
  diffHours: number;
}

function calculateEventItemLayouts(
  item: BookingResource,
  date?: Date,
): ItemLayout[] {
  if (!item.attributes.schedules || !item.attributes.schedules[0])
    return undefined;

  const layouts: ItemLayout[] = [];

  const schedules = [...item.attributes.schedules].sort((a, b) =>
    a.start < b.start ? -1 : 1,
  );

  schedules.forEach((schedule, indexSchedule) => {
    const start = parseDate(schedule.start);
    const end = parseDate(schedule.end);

    let dayStartDate = start;
    let dayEndDate = end;
    const timesInSchedule = [];

    // Separate schedule day by day
    while (dayStartDate < end) {
      if (dayStartDate.hasSame(end, 'day')) {
        dayEndDate = end;
      } else {
        dayEndDate = dayStartDate.endOf('day');
      }
      timesInSchedule.push({ start: dayStartDate, end: dayEndDate });
      dayStartDate = dayStartDate.plus({ days: 1 }).startOf('day');
    }

    timesInSchedule.forEach((time) => {
      let top = 0;
      top += time.start.hour * ONE_HOUR_HEIGHT;
      top += time.start.minute * ONE_MINUTE_HEIGHT;

      const diff = time.end.diff(time.start, ['hours', 'minutes']).toObject();
      let height = 0;
      height += diff.hours * ONE_HOUR_HEIGHT;
      height += diff.minutes * ONE_MINUTE_HEIGHT;

      // Avoid going out of the list wrapper (at the bottom)
      height = Math.min(height, 24 * ONE_HOUR_HEIGHT - top);

      const position: ItemLayout['position'] =
        indexSchedule === 0
          ? 'first'
          : indexSchedule === schedules.length - 1
            ? 'last'
            : 'middle';

      layouts.push({
        style: {
          top: top + 'px',
          height: height + 'px',
        },
        multipart: schedules.length > 1 || timesInSchedule.length > 1,
        position,
        schedule,
        date: time.start, // luxon instance
        diffHours: diff.hours,
      });
    });
  });

  if (date) {
    const targetDate = parseDate(date);
    return layouts.filter((layout) => layout.date.hasSame(targetDate, 'day'));
  } else {
    return layouts;
  }
}

export const BookingResourceListItem = ({
  item,
  date,
  refetch,
}: {
  item: BookingResource;
  date: Date;
  refetch?;
}) => {
  const state = bookingStateAliases(item.state);
  const { openDialog } = useModal();

  const onClickSeeMore = useCallback(() => {
    openDialog(BookingResourceDetailsDialog, {
      resolve: {
        bookingResource: item,
        fromServiceProvider: true,
        refetch,
      },
      size: 'lg',
    });
  }, [refetch, item]);

  const itemLayouts = useMemo(
    () => calculateEventItemLayouts(item, date),
    [item, date],
  );

  return (
    <>
      {itemLayouts.map((layout) => (
        <div
          key={layout.schedule.id}
          className={classNames(
            'px-2.5',
            item.state === 'Creating'
              ? 'bg-[var(--bg-primary-solid)] text-white'
              : 'bg-tertiary dark:bg-quaternary',
          )}
          style={layout.style}
        >
          <div
            className={
              layout.diffHours > 2
                ? 'min-h-[100px] position-sticky top-0 py-2.5'
                : 'h-full position-relative py-1.5'
            }
          >
            {layout.diffHours > 1.1 && (
              <div className="flex justify-between">
                <div>
                  <span className="block fst-italic">
                    {parseDate(layout.schedule.start).toFormat(
                      "LLL dd',' HH:mm",
                    )}
                    {' - '}
                    {parseDate(layout.schedule.end).toFormat("LLL dd',' HH:mm")}
                  </span>
                  {item.attributes.schedules.length > 1 && (
                    <Badge shape="pill" tone="outline" className="my-1">
                      {translate('+{count} more schedules', {
                        count: item.attributes.schedules.length - 1,
                      })}
                    </Badge>
                  )}
                </div>
                <span className="font-semibold">{state}</span>
              </div>
            )}
            <div className="font-semibold">{item.customer_name}</div>
            {(layout.diffHours > 2.1 ||
              (layout.diffHours > 1.1 &&
                item.attributes.schedules.length === 1)) && (
              <div>{item.project_name}</div>
            )}
            <div className="position-absolute bottom-0 end-0 mb-1.5">
              <BaseButton
                variant="tertiary"
                className={classNames(layout.diffHours < 1.1 && 'py-1')}
                onClick={onClickSeeMore}
                label={translate('See more')}
                size="sm"
              />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
