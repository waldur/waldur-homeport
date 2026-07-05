import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const AffiliateLinkFormDialog = lazyComponent(() =>
  import('./AffiliateLinkFormDialog').then((module) => ({
    default: module.AffiliateLinkFormDialog,
  })),
);

interface AffiliateLinkCreateActionProps {
  refetch(): void;
}

export const AffiliateLinkCreateAction: FC<AffiliateLinkCreateActionProps> = ({
  refetch,
}) => {
  const { openDialog } = useModal();

  return (
    <ActionButton
      title={translate('Add affiliate link')}
      variant="primary"
      iconNode={<PlusCircleIcon weight="bold" />}
      action={() =>
        openDialog(AffiliateLinkFormDialog, {
          resolve: { refetch },
        })
      }
    />
  );
};
