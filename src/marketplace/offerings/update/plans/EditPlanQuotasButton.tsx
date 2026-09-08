import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { isChargedOnPlanAmount } from '@/marketplace/common/billingTypes';
import { resolvePlanComponents } from '@/marketplace/details/plan/effectiveComponents';
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
  // plan's amount times its price, and never a prepaid component. Since the
  // dialog posts every row it shows in one payload, offering one the backend
  // refuses fails the whole save, taking the other components with it.
  //
  // Resolve against the plan first: a billing mode overrides the offering's
  // billing_type, so the raw value can say `fixed` where the plan actually
  // bills usage.
  const components = resolvePlanComponents(offering.components, plan).filter(
    isChargedOnPlanAmount,
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
