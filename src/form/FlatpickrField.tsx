import { XIcon } from '@phosphor-icons/react';
import { omit } from 'lodash-es';
import { DateTime } from 'luxon';
import { FC, ReactNode } from 'react';
import Flatpickr, { DateTimePickerProps } from 'react-flatpickr';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';

import { FormField } from './types';
import { useFlatpickrTheme } from './useFlatpickrTheme';

// react-flatpickr forwards every prop to the underlying <input>, so we strip
// the form-plumbing props (react-final-form + FormGroup wiring) that would
// otherwise produce React "unknown DOM attribute" warnings.
//
// `children` is in here for a sharper reason: under react-flatpickr v4 the
// component spreads ALL its props onto the <input> element (it destructures
// `children` but does not strip it from the spread source). Any consumer
// that passes a non-null/non-undefined `children` — even the falsy `false`
// you get from `{cond && <X />}` — trips React #137 ("input is a void
// element tag and must neither have `children` ..."). Blocking it here
// gives us a stable boundary regardless of who calls us upstream.
const NON_DOM_PROPS = [
  'input',
  'meta',
  'isInvalid',
  'isClearable',
  'validate',
  'normalize',
  'format',
  'parse',
  'noUpdateOnBlur',
  'containerClassName',
  'spaceless',
  'space',
  'hideLabel',
  'hideError',
  'forceTouched',
  'tooltip',
  'tooltipEnd',
  'tooltipProps',
  'helpEnd',
  'quickAction',
  'actions',
  'required',
  'description',
  'label',
  'controlId',
  'children',
] as const;

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
  id,
  ...props
}) => {
  const onlyTime = props.options?.enableTime && props.options?.noCalendar;

  useFlatpickrTheme();
  const input = (props as any).input;
  const flatpickrProps = omit(props as any, NON_DOM_PROPS);
  return (
    <div style={{ position: 'relative' }}>
      <Flatpickr
        id={id}
        value={
          input.value
            ? typeof input.value === 'string'
              ? DateTime.fromISO(input.value).toJSDate()
              : input.value
            : props.options.defaultDate
        }
        onChange={(value) =>
          input.onChange(
            value[0] instanceof Date
              ? onlyTime
                ? DateTime.fromJSDate(value[0]).toISOTime()
                : DateTime.fromJSDate(value[0]).toISODate()
              : value[0],
          )
        }
        className={solid ? 'form-control form-control-solid' : 'form-control'}
        placeholder={placeholder}
        {...flatpickrProps}
      />

      {input.value && typeof input.value === 'string' && !props.disabled ? (
        <button
          type="button"
          className="btn btn-icon btn-circle btn-color-muted w-25px h-25px bg-body shadow end-button"
          onClick={() => input.onChange(null)}
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
