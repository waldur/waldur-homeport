import { GitMergeIcon } from '@phosphor-icons/react';
import { DuplicateOfferingGroup } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

const DuplicateOfferingResolveDialog = lazyComponent(() =>
  import('./DuplicateOfferingResolveDialog').then((module) => ({
    default: module.DuplicateOfferingResolveDialog,
  })),
);

export const DuplicateOfferingResolveButton = ({
  row,
  refetch,
}: {
  row: DuplicateOfferingGroup;
  refetch;
}) => {
  const { openDialog } = useModal();
  const user = useUser();
  // The report is visible to staff and support, but resolving deletes
  // offerings, so the backend restricts it to staff.
  if (!user?.is_staff) {
    return null;
  }
  return (
    <ActionItem
      title={translate('Resolve duplicates')}
      iconNode={<GitMergeIcon weight="bold" />}
      action={() =>
        openDialog(DuplicateOfferingResolveDialog, {
          size: 'lg',
          resolve: { group: row, refetch },
        })
      }
    />
  );
};
