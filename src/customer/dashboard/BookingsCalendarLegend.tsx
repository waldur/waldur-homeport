import { FunctionComponent } from 'react';

import { Legend } from '@waldur/customer/dashboard/types';
import { getDistinctColorsFromEvents } from '@waldur/customer/dashboard/utils';
import './BookingsCalendarLegend.scss';

interface BookingsCalendarLegendProps {
  events;
}

export const BookingsCalendarLegend: FunctionComponent<BookingsCalendarLegendProps> =
  ({ events }) => {
    const legends: Legend[] = getDistinctColorsFromEvents(events);
    return (
      <div className="bookings-calendar-legend-container mb-3">
        {legends.map((legend: Legend, index: number) => (
          <div key={index} className="legend">
            <div
              className="rectangle me-1"
              style={{ backgroundColor: `${legend.color}` }}
            ></div>
            {legend.name}
          </div>
        ))}
      </div>
    );
  };
