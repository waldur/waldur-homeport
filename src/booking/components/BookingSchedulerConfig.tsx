import * as React from 'react';

import {TimeSelectField} from '@waldur/booking/components/TimeSelectField';
import {TranslateProps, translate} from '@waldur/i18n';
import {FormGroup} from '@waldur/marketplace/offerings/FormGroup';

type BookingSchedulerConfigProps = TranslateProps & {
  config?: {
    weekends: boolean;
    minTime: string;
    maxTime: string;
  };
  setconfig: (cb) => any;
};

export const BookingSchedulerConfig: React.FC<BookingSchedulerConfigProps> = (props): {} => {
  const [weekends, setWeekends] = React.useState<boolean>(props.config.weekends);
  const [minTime, setMinTime] = React.useState<string>(props.config.minTime);
  const [maxTime, setMaxTime] = React.useState<string>(props.config.maxTime);

  React.useCallback(
    () => {
      console.log({weekends, minTime, maxTime});
      return props.setconfig({weekends, minTime, maxTime});
    },
    [weekends, minTime, maxTime],
  );

  return (
    <>
      <FormGroup
        label={'Business hours'}
        labelClassName="control-label col-sm-3"
        description={translate('Daily available booking time range')}
      >
        <TimeSelectField name="minTime" value={minTime} onChange={setMinTime}/>
        <TimeSelectField label="to" name="maxTime" value={maxTime} onChange={setMaxTime}/>
      </FormGroup>

      <FormGroup
        label="Include weekends"
        labelClassName="control-label col-sm-3"
        valueClassName="col-sm-offset-1 checkbox-toggle"
        description={translate('Allow bookings to be scheduled at weekends')}
      >
        <input type="checkbox" id="weekendsToggle" checked={weekends} onChange={() => setWeekends(!weekends)}/>
        <label style={{margin: '5px 0 0 30px'}} htmlFor="weekendsToggle">Toggle weekends</label>
      </FormGroup>
    </>
  );
};
