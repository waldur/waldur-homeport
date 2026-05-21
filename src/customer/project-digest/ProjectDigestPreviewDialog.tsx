import { FC } from 'react';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useCustomer } from '@/workspace/hooks';

import { ProjectDigestPreview } from './ProjectDigestPreview';

export const ProjectDigestPreviewDialog: FC = () => {
  const customer = useCustomer();
  return (
    <ModalDialog
      title={translate('Digest preview')}
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      <ProjectDigestPreview customerUuid={customer.uuid} />
    </ModalDialog>
  );
};
