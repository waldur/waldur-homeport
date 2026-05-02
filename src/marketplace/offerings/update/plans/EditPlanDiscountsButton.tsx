import { TagIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Dropdown } from 'react-bootstrap';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { EDIT_PLAN_DISCOUNTS_FORM_ID } from './constants';

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
      formId: EDIT_PLAN_DISCOUNTS_FORM_ID,
      size: 'lg',
    });
  };
  return (
    <Dropdown.Item onClick={callback}>
      <TagIcon size={18} weight="bold" /> {translate('Edit discounts')}
    </Dropdown.Item>
  );
};
