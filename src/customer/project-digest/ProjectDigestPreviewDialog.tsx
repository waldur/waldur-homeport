import { FC } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { getCustomer } from '@/workspace/selectors';

import { ProjectDigestPreview } from './ProjectDigestPreview';

export const ProjectDigestPreviewDialog: FC = () => {
  const customer = useSelector(getCustomer);
  return (
    <ModalDialog
      title={translate('Digest preview')}
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      <ProjectDigestPreview customerUuid={customer.uuid} />
    </ModalDialog>
  );
};
