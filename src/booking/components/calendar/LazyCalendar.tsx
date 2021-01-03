import bootstrapPlugin from '@fullcalendar/bootstrap';
import { OptionsInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import momentPlugin from '@fullcalendar/moment';
import momentTimezonePlugin from '@fullcalendar/moment-timezone';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { FunctionComponent } from 'react';

import './Calendar.scss';
import { defaultConfig } from './defaultConfig';
import './styles';

export const LazyCalendar: FunctionComponent<OptionsInput> = (props) => (
  <FullCalendar
    plugins={[
      dayGridPlugin,
      timeGridPlugin,
      interactionPlugin,
      bootstrapPlugin,
      momentTimezonePlugin,
      momentPlugin,
      listPlugin,
    ]}
    {...defaultConfig}
    {...props}
  />
);
