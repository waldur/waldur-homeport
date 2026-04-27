import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { ProviderProjectResourcesList } from './ProviderProjectResourcesList';

interface ProviderProjectResourcesDialogProps {
  resolve: {
    project_uuid;
    provider_customer_uuid;
  };
}

export const ProviderProjectResourcesDialog: FunctionComponent<
  ProviderProjectResourcesDialogProps
> = (props) => (
  <ModalDialog
    title={translate('Resources in project and provider')}
    footer={<CloseDialogButton label={translate('Close')} />}
  >
    <ProviderProjectResourcesList {...props.resolve} />
  </ModalDialog>
);
