import { OptionsInput } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import { FunctionComponent } from 'react';

import './Calendar.scss';
import { getDefaultOptions } from './defaultConfig';
import './styles';

export const LazyCalendar: FunctionComponent<OptionsInput> = (props) => (
  <FullCalendar
    {...getDefaultOptions()}
    {...{
      defaultView: 'dayGridMonth',
      height: 'auto',
      titleFormat: {
        month: 'short',
        year: 'numeric',
        day: 'numeric',
      },
      views: {
        week: {
          columnHeaderFormat: 'ddd D/M',
        },
      },
      editable: false,
      selectable: true,
      eventOverlap: false,
      eventResizableFromStart: true,
      eventLimit: false,
      showNonCurrentDates: true,
      slotLabelFormat: 'H:mm',
    }}
    {...props}
  />
);
