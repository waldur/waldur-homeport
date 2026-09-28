import { ClockCounterClockwiseIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
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
  size = 'lg',
  variant = 'secondary',
  className,
}: VersionHistoryButtonProps) => {
  const user = useUser();
  const isVisible = user?.is_staff || user?.is_support;
  const { openDialog } = useModal();

  if (!isVisible) {
    return null;
  }

  const callback = () =>
    openDialog(VersionHistoryDialog, {
      size: 'xl',
      entityType,
      entityUuid,
      entityName,
    });

  return asDropdownItem ? (
    <ActionItem
      title={translate('Version history')}
      action={callback}
      iconNode={<ClockCounterClockwiseIcon weight="bold" />}
      className={className}
    />
  ) : (
    <BaseButton
      label={translate('Version history')}
      onClick={callback}
      iconNode={<ClockCounterClockwiseIcon weight="bold" />}
      variant={variant}
      size={size}
      className={className}
    />
  );
};
