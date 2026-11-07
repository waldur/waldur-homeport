import { PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

import { CallDurationPolicy } from '../CallDurationPolicy';
import { Call } from '../types';

/** What the rows read: the public call carries these as the protected one. */
type CallDetails = Pick<
  Call,
  | 'backend_id'
  | 'start_date'
  | 'fixed_duration_in_days'
  | 'max_prepaid_duration_months'
  | 'allowed_duration_months'
>;

/** The call's reference code, publication date and project duration. */
export const CallDetailsRows = ({ call }: { call: CallDetails }) => (
  <>
    <PropertyItem
      label={translate('Reference code')}
      value={call.backend_id}
      hideIfEmpty={false}
    />

    <PropertyItem
      label={translate('Publication date')}
      value={propVal.date(call.start_date, { precision: 'datetime' })}
      hideIfEmpty={false}
    />

    <PropertyItem
      label={translate('Project duration')}
      value={<CallDurationPolicy call={call} />}
    />
  </>
);

export const CallDetailsFields = ({ call }: { call: CallDetails }) => {
  return (
    <PropertyList variant="summary">
      <CallDetailsRows call={call} />
    </PropertyList>
  );
};
