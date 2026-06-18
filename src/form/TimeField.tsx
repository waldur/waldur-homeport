import { ClockIcon } from '@phosphor-icons/react';
import { FieldRenderProps } from 'react-final-form';
import { OptionsType } from 'react-flatpickr';

import { FlatpickrField } from './FlatpickrField';

const options: OptionsType = {
  enableTime: true,
  noCalendar: true,
  dateFormat: 'H:i',
  allowInput: true,
};

export const TimeField = ({
  solid,
  placeholder,
  input,
  id,
}: {
  solid?: boolean;
  placeholder?: string;
  input: FieldRenderProps<any>['input'];
  id?: string;
}) => (
  <FlatpickrField
    options={options}
    solid={solid}
    placeholder={placeholder}
    iconNode={<ClockIcon weight="bold" />}
    input={input}
    id={id}
  />
);
