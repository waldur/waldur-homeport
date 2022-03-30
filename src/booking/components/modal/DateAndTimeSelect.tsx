import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
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

export const DateAndTimeSelectField: FunctionComponent<DateAndTimeSelectField> =
  (props) => (
    <Form.Group>
      <Form.Label className="col-sm-2">{props.label}</Form.Label>
      <div className="col-sm-5">
        <DatePicker
          weekStartsOn={1}
          showTodayButton={true}
          todayButtonLabel={translate('Today')}
          dateFormat="DD-MM-YYYY"
          value={props.currentTime.toISO()}
          onChange={(_, formattedValue) =>
            props.onChange(
              DateTime.fromFormat(formattedValue, 'dd-MM-yyyy').toJSDate(),
            )
          }
          calendarContainer={document.getElementsByClassName('modal')[0]}
        />
      </div>
      <Form.Label className="col-sm-1" disabled={props.isDisabled}>
        <i className="fa fa-clock-o" />
      </Form.Label>
      <Select
        className="col-sm-3"
        isClearable={false}
        isSearchable={false}
        value={{
          value: props.currentTime.toFormat('HH:mm'),
          label: props.currentTime.toFormat('HH:mm'),
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
    </Form.Group>
  );
