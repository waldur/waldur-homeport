import { EyeIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { CompactActionButton } from '@waldur/table/CompactActionButton';

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
