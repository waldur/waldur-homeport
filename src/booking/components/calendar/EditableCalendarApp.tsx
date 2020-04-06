import { Calendar, OptionsInput } from '@fullcalendar/core';
import * as React from 'react';

export const EditableCalendarApp = (props: OptionsInput, options) => {
  const calRef: React.MutableRefObject<Calendar> = React.useRef();

  React.useEffect(() => {
    const curRef = calRef.current;
    const calendar = new Calendar(curRef, options);
    calendar.render();

    return () => calendar.destroy();
  }, [props]);

  React.useEffect(() => {
    calRef.current.handleOptions(props);
  }, [calRef, props]);

  return <div ref={calRef} />;
};
