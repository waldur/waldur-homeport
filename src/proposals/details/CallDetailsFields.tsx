import { PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

import { CallDurationPolicy } from '../CallDurationPolicy';
import { Call } from '../types';

export const CallDetailsFields = ({ call }: { call: Call }) => {
  return (
    <PropertyList variant="summary">
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
    </PropertyList>
  );
};
