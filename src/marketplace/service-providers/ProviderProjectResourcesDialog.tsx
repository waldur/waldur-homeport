import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { ProviderProjectResourcesList } from './ProviderProjectResourcesList';

interface ProviderProjectResourcesDialogProps {
  resolve: {
    project_uui;
    provider_uuid;
  };
}

export const ProviderProjectResourcesDialog: FunctionComponent<ProviderProjectResourcesDialogProps> =
  (props) => (
    <ModalDialog
      title={translate('Resources in project and provider')}
      footer={<CloseDialogButton />}
    >
      <ProviderProjectResourcesList {...props.resolve} />
    </ModalDialog>
  );
