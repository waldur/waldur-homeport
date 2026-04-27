import { ClockCounterClockwiseIcon } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/hooks';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionButton } from '@/table/ActionButton';
import { isStaffOrSupport } from '@/workspace/selectors';

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
  const isVisible = useSelector(isStaffOrSupport);
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
