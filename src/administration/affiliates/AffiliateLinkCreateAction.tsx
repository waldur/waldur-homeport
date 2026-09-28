import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

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
    <BaseButton
      label={translate('Add affiliate link')}
      variant="primary"
      iconNode={<PlusCircleIcon weight="bold" />}
      onClick={() =>
        openDialog(AffiliateLinkFormDialog, {
          resolve: { refetch },
        })
      }
      size="lg"
    />
  );
};
