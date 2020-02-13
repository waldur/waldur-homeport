import * as classNames from 'classnames';
import * as moment from 'moment';
import * as React from 'react';
import * as DatePicker from 'react-16-bootstrap-date-picker';

import {TimeSelectField} from '@waldur/booking/components/TimeSelectField';

import { PureDateProps } from '../store/types';

const handleChange = (newDate, newTime): Date => moment(`${newDate} ${newTime}`, 'DD-MM-YYYY HH:mm', true).toDate();

export const PureDateField = (props: PureDateProps) => (
  <>
    {props.label && <label className="col-sm-1 control-label" htmlFor={`${props.name}-date-picker`}>{props.label}</label>}
    <DatePicker
      bsClass={classNames(props.className,
        'date-input-group',
        props.label ? 'col-sm-5' : 'col-sm-6',
        props.withTime ? 'col-sm-6' : 'col-sm-6 col-sm-center',
        { disabled: props.isDisabled })}
      name={`${props.name}-date-picker`}
      weekStartsOn={1}
      showTodayButton={true}
      todayButtonLabel={'Today'}
      dateFormat="DD-MM-YYYY"
      value={moment(props.value).format()}
      onChange={ (_, formattedValue) => props.onChange(
        handleChange( formattedValue, moment(props.value).format('HH:mm') )
      )}
    />
    {props.withTime &&
      <TimeSelectField
        {...props.withTime}
        name={props.name}
        label={<i className="fa fa-clock-o" />}
        value={moment(props.value).format('HH:mm')}
        onChange={ newTime => props.onChange(
          handleChange( moment(props.value).format('DD-MM-YYYY'), newTime )
        )}
      />
    }
  </>
);
