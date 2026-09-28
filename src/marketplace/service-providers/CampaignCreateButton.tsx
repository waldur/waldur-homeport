import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const CampaignDialog = lazyComponent(() =>
  import('./CampaignDialog').then((module) => ({
    default: module.CampaignDialog,
  })),
);

export const CampaignCreateButton: FunctionComponent<{ refetch }> = ({
  refetch,
}) => {
  const { openDialog } = useModal();
  const callback = () =>
    openDialog(CampaignDialog, {
      dialogClassName: 'modal-dialog-centered',
      resolve: {
        refetch,
      },
      size: 'lg',
    });
  return (
    <BaseButton
      onClick={callback}
      label={translate('Create')}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
      size="lg"
    />
  );
};
