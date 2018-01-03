import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';
import { withTranslation } from '@waldur/i18n';
import { formatCrontab } from '@waldur/resource/crontab';
import { Field, ResourceSummaryProps, PureResourceSummaryBase } from '@waldur/resource/summary';

const PureOpenStackBackupScheduleSummary = (props: ResourceSummaryProps) => {
  const { translate, resource } = props;
  return (
    <span>
      <PureResourceSummaryBase {...props}/>
      <Field
        label={translate('Max # of backups')}
        value={resource.maximal_number_of_resources}
      />
      <Field
        label={translate('Schedule')}
        value={
          <Tooltip label={resource.schedule} id="scheduleTooltip">
            {formatCrontab(resource.schedule, translate)}
          </Tooltip>
        }
      />
      <Field
        label={translate('Is active')}
        value={resource.is_active ? translate('Yes') : translate('No')}
      />
    </span>
  );
};

export const OpenStackBackupScheduleSummary = withTranslation(PureOpenStackBackupScheduleSummary);
