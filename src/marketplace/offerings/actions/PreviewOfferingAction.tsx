import { EyeIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Offering } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const PreviewOfferingDialog = lazyComponent(() =>
  import('../list/PreviewOfferingDialog').then((module) => ({
    default: module.PreviewOfferingDialog,
  })),
);

interface PreviewOfferingActionProps {
  offering: Offering;
}

export const PreviewOfferingAction: FC<PreviewOfferingActionProps> = ({
  offering,
}) => {
  const { openDialog } = useModal();

  return (
    <ActionItem
      title={translate('Preview order form')}
      iconNode={<EyeIcon weight="bold" />}
      action={() =>
        openDialog(PreviewOfferingDialog, {
          resolve: { offering },
          size: 'lg',
        })
      }
    />
  );
};
