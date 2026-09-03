import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const EditPlanDescriptionDialog = lazyComponent(() =>
  import('./EditPlanDescriptionDialog').then((module) => ({
    default: module.EditPlanDescriptionDialog,
  })),
);

export const EditPlanDescriptionButton: FunctionComponent<{
  offering;
  plan;
  refetch;
}> = ({ offering, plan, refetch }) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditPlanDescriptionDialog, {
      resolve: { offering, plan, refetch },
      size: 'lg',
    });
  };
  return (
    <ActionItem
      title={translate('Edit')}
      action={callback}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
  );
};
