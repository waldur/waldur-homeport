import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

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
    <BaseButton
      iconNode={<PlusCircleIcon weight="bold" />}
      label={translate('Add plan')}
      onClick={callback}
      variant="tertiary"
      size="lg"
    />
  );
};
