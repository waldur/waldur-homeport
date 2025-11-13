import { TagIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

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
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditPlanDiscountsDialog, {
        resolve: { offering, plan, refetch },
        formId: EDIT_PLAN_DISCOUNTS_FORM_ID,
        size: 'lg',
      }),
    );
  };
  return (
    <Dropdown.Item onClick={callback}>
      <TagIcon size={18} weight="bold" /> {translate('Edit discounts')}
    </Dropdown.Item>
  );
};
