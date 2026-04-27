import { XIcon } from '@phosphor-icons/react';
import { DateTime } from 'luxon';
import { FC, ReactNode } from 'react';
import Flatpickr, { DateTimePickerProps } from 'react-flatpickr';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';

import { FormField } from './types';
import { useFlatpickrTheme } from './useFlatpickrTheme';

type FlatpickrFieldProps = FormField &
  DateTimePickerProps & {
    placeholder?: string;
    iconNode?: ReactNode;
    solid?: boolean;
  };

export const FlatpickrField: FC<FlatpickrFieldProps> = ({
  placeholder,
  iconNode,
  solid,
  ...props
}) => {
  const onlyTime = props.options?.enableTime && props.options?.noCalendar;

  useFlatpickrTheme();
  return (
    <div style={{ position: 'relative' }}>
      <Flatpickr
        value={
          props.input.value
            ? typeof props.input.value === 'string'
              ? DateTime.fromISO(props.input.value).toJSDate()
              : props.input.value
            : props.options.defaultDate
        }
        onChange={(value) =>
          props.input.onChange(
            value[0] instanceof Date
              ? onlyTime
                ? DateTime.fromJSDate(value[0]).toISOTime()
                : DateTime.fromJSDate(value[0]).toISODate()
              : value[0],
          )
        }
        className={solid ? 'form-control form-control-solid' : 'form-control'}
        placeholder={placeholder}
        {...props}
      />

      {props.input.value &&
      typeof props.input.value === 'string' &&
      !props.disabled ? (
        <button
          type="button"
          className="btn btn-icon btn-circle btn-color-muted w-25px h-25px bg-body shadow end-button"
          onClick={() => props.input.onChange(null)}
          style={{ position: 'absolute', right: 10, top: 10 }}
        >
          <Tip
            id="date-input-remove"
            label={translate('Remove')}
            className="w-100"
          >
            <span className="svg-icon svg-icon-2">
              <XIcon weight="bold" />
            </span>
          </Tip>
        </button>
      ) : (
        <span
          className="svg-icon svg-icon-2 svg-icon-gray-500"
          style={{
            position: 'absolute',
            right: 12,
            top: 13,
            pointerEvents: 'none',
          }}
        >
          {iconNode}
        </span>
      )}
    </div>
  );
};
