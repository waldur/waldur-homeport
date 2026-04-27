import { EyeIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { CompactActionButton } from '@/table/CompactActionButton';

const TelemetryExampleDialog = lazyComponent(() =>
  import('./TelemetryExampleDialog').then((module) => ({
    default: module.TelemetryExampleDialog,
  })),
);

export const TelemetryExampleButton = () => {
  const dispatch = useDispatch();
  return (
    <CompactActionButton
      action={() => dispatch(openModalDialog(TelemetryExampleDialog))}
      variant="link"
      iconNode={<EyeIcon weight="bold" />}
      title={translate('Show example')}
    />
  );
};
