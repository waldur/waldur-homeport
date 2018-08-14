import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';
import { withTranslation } from '@waldur/i18n';
import { formatCrontab } from '@waldur/resource/crontab';
import { Field, ResourceSummaryProps, PureResourceSummaryBase } from '@waldur/resource/summary';
import { Schedule } from '@waldur/resource/types';

const formatSchedule = ({ resource }) => (
  <Tooltip label={resource.schedule} id="scheduleTooltip">
    {formatCrontab(resource.schedule)}
  </Tooltip>
);

const PureOpenStackSnapshotScheduleSummary = (props: ResourceSummaryProps<Schedule>) => {
  const { translate, resource } = props;
  return (
    <span>
      <PureResourceSummaryBase {...props}/>
      <Field
        label={translate('Max # of snapshots')}
        value={resource.maximal_number_of_resources}
      />
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
    </span>
  );
};

export const OpenStackSnapshotScheduleSummary = withTranslation(PureOpenStackSnapshotScheduleSummary);
