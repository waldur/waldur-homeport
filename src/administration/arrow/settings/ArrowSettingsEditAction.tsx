import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import type { ArrowSettings } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const ArrowSettingsEditDialog = lazyComponent(() =>
  import('./ArrowSettingsEditDialog').then((module) => ({
    default: module.ArrowSettingsEditDialog,
  })),
);

interface ArrowSettingsEditActionProps {
  settings: ArrowSettings;
  refetch: () => void;
}

export const ArrowSettingsEditAction = ({
  settings,
  refetch,
}: ArrowSettingsEditActionProps) => {
  const { openDialog } = useModal();

  const handleEdit = useCallback(() => {
    openDialog(ArrowSettingsEditDialog, {
      resolve: { settings, refetch },
      size: 'lg',
    });
  }, [settings, refetch, openDialog]);

  return (
    <ActionButton
      action={handleEdit}
      title={translate('Edit')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      variant="secondary"
    />
  );
};
