import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Dropdown } from 'react-bootstrap';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { EDIT_PLAN_FORM_ID } from './constants';

const EditPlanQuotasDialog = lazyComponent(() =>
  import('./EditPlanQuotasDialog').then((module) => ({
    default: module.EditPlanQuotasDialog,
  })),
);

export const EditPlanQuotasButton: FunctionComponent<{
  offering;
  plan;
  refetch;
}> = ({ offering, plan, refetch }) => {
  const { openDialog } = useModal();
  const components = offering.components.filter(
    (c) =>
      c.billing_type === 'fixed' ||
      c.billing_type === 'one' ||
      c.billing_type === 'few',
  );
  if (components.length === 0) {
    return null;
  }
  const callback = () => {
    openDialog(EditPlanQuotasDialog, {
      resolve: { offering, plan, refetch, components },
      formId: EDIT_PLAN_FORM_ID,
      size: 'lg',
    });
  };
  return (
    <Dropdown.Item onClick={callback}>
      <PencilSimpleIcon size={18} weight="bold" /> {translate('Edit quotas')}
    </Dropdown.Item>
  );
};
