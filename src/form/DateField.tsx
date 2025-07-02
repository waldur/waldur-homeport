import { CalendarBlankIcon, XIcon } from '@phosphor-icons/react';
import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import Flatpickr from 'react-flatpickr';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

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
  };
  if (props.enable) {
    options.enable = props.enable;
  }
  return (
    <div style={{ position: 'relative' }}>
      <Flatpickr
        options={options}
        value={
          props.input.value && typeof props.input.value === 'string'
            ? DateTime.fromISO(props.input.value).toJSDate()
            : props.defaultDate
        }
        onChange={(value) =>
          props.input.onChange(
            value[0] instanceof Date
              ? DateTime.fromJSDate(value[0]).toISODate()
              : value[0],
          )
        }
        className={
          props.solid ? 'form-control form-control-solid' : 'form-control'
        }
        placeholder={props.placeholder}
      />

      {props.input.value && typeof props.input.value === 'string' ? (
        <button
          type="button"
          className="btn btn-icon btn-circle btn-color-muted btn-active-color-primary w-25px h-25px bg-body shadow end-button"
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
          <CalendarBlankIcon weight="bold" />
        </span>
      )}
    </div>
  );
};
