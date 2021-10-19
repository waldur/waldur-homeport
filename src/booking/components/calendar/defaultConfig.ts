import bootstrapPlugin from '@fullcalendar/bootstrap';
import { OptionsInput } from '@fullcalendar/core';
import allLocales from '@fullcalendar/core/locales-all';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import luxonPlugin from '@fullcalendar/luxon';
import timeGridPlugin from '@fullcalendar/timegrid';

import { LanguageUtilsService } from '@waldur/i18n/LanguageUtilsService';

export const getDefaultOptions = () =>
  ({
    plugins: [
      dayGridPlugin,
      timeGridPlugin,
      interactionPlugin,
      bootstrapPlugin,
      luxonPlugin,
      listPlugin,
    ],
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short',
      hour12: false,
      omitZeroMinute: true,
    },
    themeSystem: 'bootstrap',
    timeZone: 'local',
    firstDay: 1,
    fixedWeekCount: false,
    slotEventOverlap: false,
    locale: LanguageUtilsService.getCurrentLanguage().code,
    locales: allLocales,
  } as OptionsInput);
