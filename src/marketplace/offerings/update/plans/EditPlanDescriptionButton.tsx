import { PencilSimple } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { EDIT_PLAN_FORM_ID } from './constants';

const EditPlanDescriptionDialog = lazyComponent(
  () => import('./EditPlanDescriptionDialog'),
  'EditPlanDescriptionDialog',
);

export const EditPlanDescriptionButton: FunctionComponent<{
  offering;
  plan;
  refetch;
}> = ({ offering, plan, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditPlanDescriptionDialog, {
        resolve: { offering, plan, refetch },
        formId: EDIT_PLAN_FORM_ID,
        size: 'lg',
      }),
    );
  };
  return (
    <Dropdown.Item onClick={callback}>
      <PencilSimple size={18} /> {translate('Edit')}
    </Dropdown.Item>
  );
};
