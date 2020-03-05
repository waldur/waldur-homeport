import * as classNames from 'classnames';
import * as moment from 'moment';
import * as React from 'react';
import * as DatePicker from 'react-16-bootstrap-date-picker';

import {TimeSelectField} from '@waldur/booking/components/TimeSelectField';
import {translate} from '@waldur/i18n';

import { PureDateProps } from '../store/types';

const handleChange = (newDate, newTime): Date =>
  moment(`${newDate} ${newTime}`, 'DD-MM-YYYY HH:mm', true).toDate();

export const PureDateField = (props: PureDateProps) => (
  <>
    {props.label && <label className="col-xs-2 control-label" htmlFor={`${props.name}-date-picker`}>{props.label}</label>}
    <div className={classNames(
      props.className,
      props.label ? 'col-xs-10 col-md-4' : 'col-xs-12 col-md-6',
      props.withTime ? 'col-sm-6' : '',
      { disabled: props.isDisabled }
      )}>
      <DatePicker
        name={`${props.name}-date-picker`}
        weekStartsOn={1}
        showClearButton={false}
        showTodayButton={true}
        todayButtonLabel={translate('Today')}
        dateFormat="DD-MM-YYYY"
        value={moment(props.value).format()}
        onChange={ (_, formattedValue) => {
          if (props.withTime) {
            props.onChange(handleChange( formattedValue, moment(props.value).format('HH:mm') ));
          } else {
            props.onChange(formattedValue);
          }
        }}
      />
    </div>
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
