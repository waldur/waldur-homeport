import * as React from 'react';

import { withTranslation } from '@waldur/i18n';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';
import { PureScheduleSummary } from '@waldur/resource/summary/ScheduleSummary';
import { Schedule } from '@waldur/resource/types';

const PureOpenStackBackupScheduleSummary = (props: ResourceSummaryProps<Schedule>) => {
  const { translate, resource } = props;
  return (
    <>
      <PureScheduleSummary {...props}/>
      <Field
        label={translate('Max # of backups')}
        value={resource.maximal_number_of_resources}
      />
    </>
  );
};

export const OpenStackBackupScheduleSummary = withTranslation(PureOpenStackBackupScheduleSummary);
