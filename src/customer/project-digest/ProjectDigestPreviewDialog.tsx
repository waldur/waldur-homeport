import { FC } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { getCustomer } from '@waldur/workspace/selectors';

import { ProjectDigestPreview } from './ProjectDigestPreview';

export const ProjectDigestPreviewDialog: FC = () => {
  const customer = useSelector(getCustomer);
  return (
    <ModalDialog
      title={translate('Digest preview')}
      closeButton
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      <ProjectDigestPreview customerUuid={customer.uuid} />
    </ModalDialog>
  );
};
