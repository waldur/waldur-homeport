import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

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
  // Mirrors what update_quotas accepts: the billing types whose charge is the
  // plan's amount times its price, and never a prepaid component. A prepaid
  // component's quantity is the limit the customer requests times the length of
  // the subscription, so a value entered here would be saved nowhere and
  // ignored everywhere — and since the dialog posts every row it shows in one
  // payload, offering one the backend refuses fails the whole save, taking the
  // other components with it.
  const components = offering.components.filter(
    (c) =>
      !c.is_prepaid &&
      (c.billing_type === 'fixed' ||
        c.billing_type === 'one' ||
        c.billing_type === 'few'),
  );
  if (components.length === 0) {
    return null;
  }
  const callback = () => {
    openDialog(EditPlanQuotasDialog, {
      resolve: { offering, plan, refetch, components },
      size: 'lg',
    });
  };
  return (
    <ActionItem
      title={translate('Edit quotas')}
      action={callback}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
  );
};
