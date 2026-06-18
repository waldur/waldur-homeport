import { CalendarBlankIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { type DateTimePickerProps } from 'react-flatpickr';

import { FlatpickrField } from './FlatpickrField';
import { FormField } from './types';

type DateTimeFieldProps = FormField &
  DateTimePickerProps['options'] & {
    placeholder?: string;
    solid?: boolean;
  };

export const DateTimeField: FunctionComponent<DateTimeFieldProps> = (props) => {
  return (
    <FlatpickrField
      options={{
        enableTime: true,
        dateFormat: props.dateFormat || 'Z',
        minDate: props.minDate,
      }}
      solid={props.solid}
      placeholder={props.placeholder}
      iconNode={<CalendarBlankIcon weight="bold" />}
      input={props.input}
      id={props.id}
    />
  );
};
