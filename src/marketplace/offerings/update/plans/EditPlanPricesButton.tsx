import { CoinsIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const EditPlanPricesDialog = lazyComponent(() =>
  import('./EditPlanPricesDialog').then((module) => ({
    default: module.EditPlanPricesDialog,
  })),
);

export const EditPlanPricesButton: FunctionComponent<{
  offering;
  plan;
  refetch;
}> = ({ offering, plan, refetch }) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditPlanPricesDialog, {
      resolve: { offering, plan, refetch },
      size: 'lg',
    });
  };
  return (
    <ActionItem
      title={translate('Edit prices')}
      action={callback}
      iconNode={<CoinsIcon weight="bold" />}
    />
  );
};
