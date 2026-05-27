import { ClockCounterClockwiseIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionButton } from '@/table/ActionButton';
import { useUser } from '@/workspace/hooks';

import { VersionHistoryButtonProps } from './types';

const VersionHistoryDialog = lazyComponent(() =>
  import('./VersionHistoryDialog').then((module) => ({
    default: module.VersionHistoryDialog,
  })),
);

export const VersionHistoryButton = ({
  entityType,
  entityUuid,
  entityName,
  asDropdownItem = false,
}: VersionHistoryButtonProps) => {
  const user = useUser();
  const isVisible = user?.is_staff || user?.is_support;
  const { openDialog } = useModal();

  if (!isVisible) {
    return null;
  }

  const Component = asDropdownItem ? ActionItem : ActionButton;

  return (
    <Component
      title={translate('Version history')}
      action={() =>
        openDialog(VersionHistoryDialog, {
          size: 'xl',
          entityType,
          entityUuid,
          entityName,
        })
      }
      iconNode={<ClockCounterClockwiseIcon weight="bold" />}
    />
  );
};
