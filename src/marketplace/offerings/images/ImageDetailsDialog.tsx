import { FunctionComponent } from 'react';
import { NestedScreenshot } from 'waldur-js-client';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

interface ImageDetailsDialogProps {
  resolve: NestedScreenshot;
}

export const ImageDetailsDialog: FunctionComponent<ImageDetailsDialogProps> = (
  props,
) => (
  <ModalDialog
    title={translate('Viewing image')}
    footer={<CloseDialogButton label={translate('Close')} />}
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <img src={props.resolve.image} alt={translate('Image here')} />
      <span style={{ marginTop: '10px' }}>{props.resolve.description}</span>
    </div>
  </ModalDialog>
);
