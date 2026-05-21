import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { ResourceProject } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const RestoreProjectDialog = lazyComponent(() =>
  import('./RestoreProjectDialog').then((module) => ({
    default: module.RestoreProjectDialog,
  })),
);

export const RestoreProjectAction: FC<{
  row: ResourceProject;
  refetch(): void;
}> = ({ row, refetch }) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Recover')}
      action={() =>
        openDialog(RestoreProjectDialog, {
          resolve: { resource_project: row, refetch },
        })
      }
      iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
    />
  );
};
