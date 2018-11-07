import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { withTranslation } from '@waldur/i18n';
import { Field, ResourceSummaryProps, PureResourceSummaryBase } from '@waldur/resource/summary';
import { Schedule } from '@waldur/resource/types';
import { formatRetentionTime, formatSchedule } from '@waldur/resource/utils';

export const PureScheduleSummary: React.SFC<ResourceSummaryProps<Schedule>> = props => {
  const { translate, resource } = props;
  return (
    <>
      <PureResourceSummaryBase {...props}/>
      <Field
        label={translate('Schedule')}
        value={formatSchedule(props)}
      />
      <Field
        label={translate('Timezone')}
        value={resource.timezone}
      />
      <Field
        label={translate('Is active')}
        value={resource.is_active ? translate('Yes') : translate('No')}
      />
      <Field
        label={translate('Retention time')}
        value={formatRetentionTime(props)}
      />
      <Field
        label={translate('Next trigger at')}
        value={formatDateTime(resource.next_trigger_at)}
      />
    </>
  );
};

export const ScheduleSummary = withTranslation(PureScheduleSummary);
