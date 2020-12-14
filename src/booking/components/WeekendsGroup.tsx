import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

interface WeekendsGroupProps {
  weekends: boolean;
  setWeekends(val: boolean): void;
}

export const WeekendsGroup: FunctionComponent<WeekendsGroupProps> = ({
  weekends,
  setWeekends,
}) => (
  <FormGroup
    label={translate('Include weekends')}
    labelClassName="control-label col-sm-3"
    description={translate('Allow bookings to be scheduled at weekends')}
  >
    <div className="checkbox-toggle">
      <input
        type="checkbox"
        id="weekendsToggle"
        checked={weekends}
        onChange={() => setWeekends(!weekends)}
      />
      <label htmlFor="weekendsToggle">Toggle weekends</label>
    </div>
  </FormGroup>
);
