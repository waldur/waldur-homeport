import { EyeIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CompactActionButton } from '@/table/CompactActionButton';

const TelemetryExampleDialog = lazyComponent(() =>
  import('./TelemetryExampleDialog').then((module) => ({
    default: module.TelemetryExampleDialog,
  })),
);

export const TelemetryExampleButton = () => {
  const { openDialog } = useModal();
  return (
    <CompactActionButton
      action={() => openDialog(TelemetryExampleDialog)}
      variant="link"
      iconNode={<EyeIcon weight="bold" />}
      title={translate('Show example')}
    />
  );
};
