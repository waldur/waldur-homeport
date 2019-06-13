import { OptionsInput } from '@fullcalendar/core/types/input-types';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';

import * as React from 'react';

// tslint:disable-next-line: waldur-import-validate
import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';

import './Calendar.scss';
import { defaultConfig } from './defaultConfig';

export const Calendar = (props: OptionsInput) => (
  <FullCalendar
    plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
    {...defaultConfig}
    {...props} />
);
