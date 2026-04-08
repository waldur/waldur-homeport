import { CalendarBlankIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { FlatpickrField } from './FlatpickrField';
import { useFlatpickrTheme } from './useFlatpickrTheme';

export const DateField: FunctionComponent<any> = (props) => {
  useFlatpickrTheme();
  const options: Record<string, any> = {
    dateFormat: 'Y-m-d',
    minDate: props.minDate,
    maxDate: props.maxDate,
    defaultDate: props.defaultDate,
    monthSelectorType: 'static',
    inline: props.inline,
    allowInvalidPreload: true,
    clickOpens: !props.disabled,
  };
  if (props.enable) {
    options.enable = props.enable;
  }
  return (
    <FlatpickrField
      options={options}
      solid={props.solid}
      placeholder={props.placeholder}
      iconNode={<CalendarBlankIcon weight="bold" />}
      input={props.input}
      disabled={props.disabled}
    />
  );
};
