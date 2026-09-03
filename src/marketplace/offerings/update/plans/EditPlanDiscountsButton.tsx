import { TagIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const EditPlanDiscountsDialog = lazyComponent(() =>
  import('./EditPlanDiscountsDialog').then((module) => ({
    default: module.EditPlanDiscountsDialog,
  })),
);

export const EditPlanDiscountsButton: FunctionComponent<{
  offering;
  plan;
  refetch;
}> = ({ offering, plan, refetch }) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditPlanDiscountsDialog, {
      resolve: { offering, plan, refetch },
      size: 'lg',
    });
  };
  return (
    <ActionItem
      title={translate('Edit discounts')}
      action={callback}
      iconNode={<TagIcon weight="bold" />}
    />
  );
};
