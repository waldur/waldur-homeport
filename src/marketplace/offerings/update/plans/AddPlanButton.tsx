import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

import { ADD_PLAN_FORM_ID } from './constants';

const AddPlanDialog = lazyComponent(() =>
  import('./AddPlanDialog').then((module) => ({
    default: module.AddPlanDialog,
  })),
);

export const AddPlanButton: FunctionComponent<{
  offering;
  refetch;
}> = ({ offering, refetch }) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(AddPlanDialog, {
      resolve: { offering, refetch },
      size: 'lg',
      formId: ADD_PLAN_FORM_ID,
    });
  };
  return (
    <ActionButton
      iconNode={<PlusCircleIcon weight="bold" />}
      title={translate('Add plan')}
      action={callback}
    />
  );
};
