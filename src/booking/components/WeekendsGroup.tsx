import { FunctionComponent } from 'react';

import { Switch } from 'waldur-ui';

import { FormGroup } from '@/form';
import { translate } from '@/i18n';

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
    help={translate('Allow bookings to be scheduled at weekends')}
  >
    <Switch
      id="weekendsToggle"
      aria-label={translate('Include weekends')}
      checked={weekends}
      onCheckedChange={setWeekends}
    />
  </FormGroup>
);
