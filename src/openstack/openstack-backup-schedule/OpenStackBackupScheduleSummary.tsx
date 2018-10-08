import * as React from 'react';

import { withTranslation } from '@waldur/i18n';
import { Field, ResourceSummaryProps, PureResourceSummaryBase } from '@waldur/resource/summary';
import { Schedule } from '@waldur/resource/types';
import { formatRetentionTime, formatSchedule } from '@waldur/resource/utils';

const PureOpenStackBackupScheduleSummary = (props: ResourceSummaryProps<Schedule>) => {
  const { translate, resource } = props;
  return (
    <span>
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
        label={translate('Max # of backups')}
        value={resource.maximal_number_of_resources}
      />
      <Field
        label={translate('Retention time')}
        value={formatRetentionTime(props)}
      />
    </span>
  );
};

export const OpenStackBackupScheduleSummary = withTranslation(PureOpenStackBackupScheduleSummary);
