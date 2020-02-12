import * as moment from 'moment';
import * as React from 'react';

import {TimeSelectField} from '@waldur/booking/components/TimeSelectField';
import {translate} from '@waldur/i18n';
import {FormGroup} from '@waldur/marketplace/offerings/FormGroup';

interface BookingSchedulerConfigProps {
  conf: ({weekends, minTime, maxTime}) => any;
}

export const BookingSchedulerConfig: React.FC<BookingSchedulerConfigProps> = props => {
  const [weekends, setWeekends] = React.useState<boolean>(true);
  const [minTime, setMinTime] = React.useState<string>(moment().startOf('day').format('HH:mm'));
  const [maxTime, setMaxTime] = React.useState<string>(moment().endOf('day').format('HH:mm'));

  React.useEffect(() => props.conf({weekends, minTime, maxTime}), [weekends, minTime, maxTime]);

  return (
    <>
      <FormGroup
        label={'Business hours'}
        labelClassName="control-label col-sm-2"
        description={translate('Daily available booking time range')}>
        <TimeSelectField label="from" name="minTime" value={minTime} onChange={setMinTime}/>
        <TimeSelectField label="till" name="maxTime" value={maxTime} onChange={setMaxTime}/>
      </FormGroup>

      <FormGroup
        label="Include weekends"
        labelClassName="control-label col-sm-2"
        valueClassName="col-sm-offset-1 checkbox-toggle"
        description={translate('Allow bookings to be scheduled at weekends')}>
        <input type="checkbox" id="weekendsToggle" checked={weekends} onChange={() => setWeekends(!weekends)}/>
        <label style={{margin: '5px 0 0 30px'}} htmlFor="weekendsToggle">Toggle weekends</label>
      </FormGroup>
    </>
  );
};
