import { TagIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionsDropdownItem } from '@/table/ActionsDropdown';

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
    <ActionsDropdownItem onSelect={callback}>
      <TagIcon size={18} weight="bold" /> {translate('Edit discounts')}
    </ActionsDropdownItem>
  );
};
