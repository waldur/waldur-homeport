import { ClockCounterClockwiseIcon } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionButton } from '@waldur/table/ActionButton';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

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
