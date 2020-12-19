import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { Screenshot } from '@waldur/marketplace/types';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface ScreenshotDetailsDialogProps {
  resolve: Screenshot;
}

export const ScreenshotDetailsDialog: FunctionComponent<ScreenshotDetailsDialogProps> = (
  props,
) => (
  <ModalDialog
    title={translate('Viewing screenshot')}
    footer={<CloseDialogButton />}
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <img src={props.resolve.image} alt={translate('Screenshot here')} />
      <span style={{ marginTop: '10px' }}>{props.resolve.description}</span>
    </div>
  </ModalDialog>
);
