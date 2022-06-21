import { translate } from '@waldur/i18n';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';
import { ScheduleSummary } from '@waldur/resource/summary/ScheduleSummary';
import { Schedule } from '@waldur/resource/types';

export const OpenStackBackupScheduleSummary = (
  props: ResourceSummaryProps<Schedule>,
) => {
  const { resource } = props;
  return (
    <>
      <ScheduleSummary {...props} />
      <Field
        label={translate('Max # of VM snapshots')}
        value={resource.maximal_number_of_resources}
      />
    </>
  );
};
