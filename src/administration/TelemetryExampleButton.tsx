import { EyeIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const TelemetryExampleDialog = lazyComponent(() =>
  import('./TelemetryExampleDialog').then((module) => ({
    default: module.TelemetryExampleDialog,
  })),
);

export const TelemetryExampleButton = () => {
  const { openDialog } = useModal();
  return (
    <BaseButton
      onClick={() => openDialog(TelemetryExampleDialog)}
      variant="text-primary"
      iconNode={<EyeIcon weight="bold" />}
      label={translate('Show example')}
      size="sm"
    />
  );
};
