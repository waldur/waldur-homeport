import * as classNames from 'classnames';
import * as moment from 'moment';
import * as React from 'react';
import * as DatePicker from 'react-16-bootstrap-date-picker';
import Select from 'react-select';

import { timelineLabels } from '@waldur/booking/utils';
import { reactSelectMenuPortaling } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import './DateAndTimeSelect.scss';

interface DateAndTimeSelectField {
  name: string;
  label: string;
  currentTime: any;
  onChange: any;
  minuteStep?: number;
  isDisabled?: boolean;
}

interface TimeSelect {
  hour: number;
  minute: number;
}

export const DateAndTimeSelectField = (props: DateAndTimeSelectField) => (
  <div className="form-group">
    <label className="control-label col-sm-2">{props.label}</label>
    <div className="col-sm-5">
      <DatePicker
        name={name}
        weekStartsOn={1}
        showTodayButton={true}
        todayButtonLabel={translate('Today')}
        dateFormat="DD-MM-YYYY"
        value={props.currentTime.toISOString()}
        onChange={(_, formattedValue) =>
          props.onChange(
            moment.utc(formattedValue, 'DD-MM-YYYY', true).toDate(),
          )
        }
        calendarContainer={document.getElementsByClassName('modal')[0]}
      />
    </div>
    <label
      className={classNames('control-label', 'col-sm-1', {
        disabled: props.isDisabled,
      })}
    >
      <i className="fa fa-clock-o" />
    </label>
    <Select
      name={name}
      className="col-sm-3"
      isClearable={false}
      isSearchable={false}
      value={{
        value: props.currentTime.format('HH:mm'),
        label: props.currentTime.format('HH:mm'),
      }}
      onChange={(selectOpt: TimeSelect) =>
        props.onChange(
          props.currentTime
            .set({ hour: selectOpt.hour, minute: selectOpt.minute })
            .toDate(),
        )
      }
      options={timelineLabels(props.minuteStep)}
      isDisabled={props.isDisabled}
      {...reactSelectMenuPortaling()}
    />
  </div>
);
