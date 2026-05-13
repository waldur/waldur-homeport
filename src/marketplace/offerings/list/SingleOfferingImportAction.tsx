import { UploadSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

import { SINGLE_OFFERING_IMPORT_FORM_ID } from '../single-import/constants';

const SingleOfferingImportDialog = lazyComponent(() =>
  import('../single-import/SingleOfferingImportDialog').then((module) => ({
    default: module.SingleOfferingImportDialog,
  })),
);

interface SingleOfferingImportActionProps {
  refetch(): void;
}

export const SingleOfferingImportAction: FC<
  SingleOfferingImportActionProps
> = ({ refetch }) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Import offering')}
      action={() => {
        openDialog(SingleOfferingImportDialog, {
          resolve: { refetch },
          size: 'lg',
          formId: SINGLE_OFFERING_IMPORT_FORM_ID,
        });
      }}
      iconNode={<UploadSimpleIcon weight="bold" />}
    />
  );
};
