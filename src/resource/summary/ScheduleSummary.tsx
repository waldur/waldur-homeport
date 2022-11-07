import React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';
import { Schedule } from '@waldur/resource/types';
import { formatRetentionTime, formatSchedule } from '@waldur/resource/utils';

export const ScheduleSummary: React.FC<ResourceSummaryProps<Schedule>> = (
  props,
) => {
  const { resource } = props;
  return (
    <>
      <Field label={translate('Schedule')} value={formatSchedule(props)} />
      <Field label={translate('Time zone')} value={resource.timezone} />
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
