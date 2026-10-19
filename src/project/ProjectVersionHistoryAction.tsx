import { ClockCounterClockwiseIcon } from '@phosphor-icons/react';
import { Project } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { useUser } from '@/workspace/hooks';

const VersionHistoryDialog = lazyComponent(() =>
  import('@/version-history/VersionHistoryDialog').then((module) => ({
    default: module.VersionHistoryDialog,
  })),
);

export const ProjectVersionHistoryAction = ({
  project,
}: {
  project: Project;
}) => {
  const user = useUser();

  if (!user?.is_staff && !user?.is_support) {
    return null;
  }

  return (
    <DialogActionItem
      title={translate('Version history')}
      modalComponent={VersionHistoryDialog}
      dialogSize="xl"
      resource={project}
      extraResolve={{
        entityType: 'project',
        entityUuid: project.uuid,
        entityName: project.name,
      }}
      iconNode={<ClockCounterClockwiseIcon weight="bold" />}
      staff
    />
  );
};
