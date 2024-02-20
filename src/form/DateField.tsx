import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import Flatpickr from 'react-flatpickr';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

export const DateField: FunctionComponent<any> = (props) => (
  <>
    {props.label && <label>{props.label}</label>}
    <Flatpickr
      options={{
        dateFormat: 'Y-m-d',
        minDate: props.minDate,
        maxDate: props.maxDate,
        defaultDate: props.defaultDate,
      }}
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
      className="form-control form-control-solid"
    />
    {props.input.value && typeof props.input.value === 'string' && (
      <span
        className="btn btn-icon btn-circle btn-color-muted btn-active-color-primary w-25px h-25px bg-body shadow end-button"
        onClick={() => props.input.onChange(null)}
      >
        <Tip
          id="date-input-remove"
          label={translate('Remove')}
          className="w-100"
        >
          <i className="fa fa-times fs-6"></i>
        </Tip>
      </span>
    )}
  </>
);
