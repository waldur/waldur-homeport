import { CalendarBlankIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { DateTimePickerProps } from 'react-flatpickr';

import { FlatpickrField } from './FlatpickrField';
import { useFlatpickrTheme } from './useFlatpickrTheme';

export const DateField: FunctionComponent<any> = ({
  minDate,
  maxDate,
  defaultDate,
  inline,
  disabled,
  enable,
  solid,
  placeholder,
  input,
  ...rest
}) => {
  useFlatpickrTheme();
  const options: DateTimePickerProps['options'] = {
    dateFormat: 'Y-m-d',
    minDate: minDate,
    maxDate: maxDate,
    defaultDate: defaultDate,
    monthSelectorType: 'static',
    inline: inline,
    allowInvalidPreload: true,
    clickOpens: !disabled,
  };
  if (enable) {
    options.enable = enable;
  }
  return (
    <FlatpickrField
      options={options}
      solid={solid}
      placeholder={placeholder}
      iconNode={<CalendarBlankIcon weight="bold" />}
      input={input}
      disabled={disabled}
      {...rest}
    />
  );
};
