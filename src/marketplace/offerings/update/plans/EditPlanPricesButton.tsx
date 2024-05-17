import { Coins } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { EDIT_PLAN_FORM_ID } from './constants';

const EditPlanPricesDialog = lazyComponent(
  () => import('./EditPlanPricesDialog'),
  'EditPlanPricesDialog',
);

export const EditPlanPricesButton: FunctionComponent<{
  offering;
  plan;
  refetch;
}> = ({ offering, plan, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditPlanPricesDialog, {
        resolve: { offering, plan, refetch },
        formId: EDIT_PLAN_FORM_ID,
        size: 'lg',
      }),
    );
  };
  return (
    <Dropdown.Item onClick={callback}>
      <Coins size={18} /> {translate('Edit prices')}
    </Dropdown.Item>
  );
};
