import { ClockIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { FlatpickrField } from './FlatpickrField';
import { useFlatpickrTheme } from './useFlatpickrTheme';

export const TimeField: FunctionComponent<any> = (props) => {
  useFlatpickrTheme();
  const options: Record<string, any> = {
    enableTime: true,
    noCalendar: true,
    dateFormat: 'H:i',
    allowInput: true,
  };

  return (
    <FlatpickrField
      options={options}
      solid={props.solid}
      placeholder={props.placeholder}
      iconNode={<ClockIcon weight="bold" />}
      input={props.input}
      id={props.id}
    />
  );
};
