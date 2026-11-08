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
    <div className="flex flex-col justify-center">
      <img src={props.resolve.image} alt={translate('Image here')} />
      <span className="mt-2.5">{props.resolve.description}</span>
    </div>
  </ModalDialog>
);
