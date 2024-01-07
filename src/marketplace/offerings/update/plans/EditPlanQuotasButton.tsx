import { FunctionComponent } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { EDIT_PLAN_FORM_ID } from './constants';

const EditPlanQuotasDialog = lazyComponent(
  () => import('./EditPlanQuotasDialog'),
  'EditPlanQuotasDialog',
);

export const EditPlanQuotasButton: FunctionComponent<{
  offering;
  plan;
  refetch;
}> = ({ offering, plan, refetch }) => {
  const dispatch = useDispatch();
  const components = offering.components.filter(
    (c) => c.billing_type === 'fixed',
  );
  if (components.length === 0) {
    return null;
  }
  const callback = () => {
    dispatch(
      openModalDialog(EditPlanQuotasDialog, {
        resolve: { offering, plan, refetch, components },
        formId: EDIT_PLAN_FORM_ID,
        size: 'lg',
      }),
    );
  };
  return (
    <Dropdown.Item onClick={callback}>
      <i className="fa fa-pencil" /> {translate('Edit quotas')}
    </Dropdown.Item>
  );
};
