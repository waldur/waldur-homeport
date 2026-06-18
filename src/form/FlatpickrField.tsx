import { XIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import { FC, ReactNode } from 'react';
import { FieldRenderProps } from 'react-final-form';
import Flatpickr, { DateTimePickerProps } from 'react-flatpickr';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';

import { useFlatpickrTheme } from './useFlatpickrTheme';

// ── Base (Pure UI) ──────────────────────────────────────

interface BaseFlatpickrFieldProps extends Omit<
  DateTimePickerProps,
  'value' | 'onChange'
> {
  /** Current date value — ISO string, Date, or undefined */
  value?: string | Date | null;
  /** Called with the selected value (ISO string or null) */
  onChange?: (value: string | null) => void;
  placeholder?: string;
  iconNode?: ReactNode;
  solid?: boolean;
  disabled?: boolean;
}

const BaseFlatpickrField: FC<BaseFlatpickrFieldProps> = ({
  value,
  onChange,
  placeholder,
  iconNode,
  solid,
  disabled,
  options,
  id,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  children: _children, // Strip children because react-flatpickr passes it to <input>
  ...rest
}) => {
  const onlyTime = options?.enableTime && options?.noCalendar;

  useFlatpickrTheme();

  return (
    <div style={{ position: 'relative' }}>
      <Flatpickr
        id={id}
        value={
          value
            ? typeof value === 'string'
              ? DateTime.fromISO(value).toJSDate()
              : value
            : options?.defaultDate
        }
        onChange={(dates) =>
          onChange?.(
            dates[0] instanceof Date
              ? onlyTime
                ? DateTime.fromJSDate(dates[0]).toISOTime()
                : DateTime.fromJSDate(dates[0]).toISODate()
              : dates[0],
          )
        }
        className={classNames('form-control', solid && 'form-control-solid')}
        placeholder={placeholder}
        options={options}
        disabled={disabled}
        {...rest}
      />

      {value && typeof value === 'string' && !disabled ? (
        <button
          type="button"
          className="btn btn-icon btn-circle btn-color-muted w-25px h-25px bg-body shadow end-button"
          onClick={() => onChange?.(null)}
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
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        >
          {iconNode}
        </span>
      )}
    </div>
  );
};

// ── Field Adapter ───────────────────────────────────────

export interface FlatpickrFieldProps extends Omit<
  BaseFlatpickrFieldProps,
  'value' | 'onChange'
> {
  input: FieldRenderProps<any>['input'];
  // Optional because the Date/Time/DateTime wrappers strip `meta` upstream and
  // never forward it; declared here so it can be destructured away (below)
  // instead of leaking onto the underlying <input> via ...rest.
  meta?: FieldRenderProps<any>['meta'];
}

export const FlatpickrField: FC<FlatpickrFieldProps> = ({
  input,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  meta: _meta,
  ...rest
}) => (
  <BaseFlatpickrField {...rest} value={input.value} onChange={input.onChange} />
);
