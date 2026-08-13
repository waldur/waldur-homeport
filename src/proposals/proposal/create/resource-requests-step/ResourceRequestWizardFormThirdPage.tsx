import { FunctionComponent } from 'react';
import { useFormState } from 'react-final-form';

import { translate } from '@/i18n';
import { OptionsForm } from '@/marketplace/common/OptionsForm';
import { PurchaseOrderFields } from '@/proposals/PurchaseOrderFields';
import { getPurchaseOrderRequirement } from '@/proposals/purchaseOrderRequirement';
import { computeRequestedCost } from '@/proposals/requestedResourceCost';
import { RequestedResourceCostLabel } from '@/proposals/RequestedResourceCostLabel';
import { WizardForm, WizardFormStepProps } from '@/wizard';

export const ResourceRequestWizardFormThirdPage: FunctionComponent<
  WizardFormStepProps
> = (props) => {
  const { values } = useFormState({
    subscription: { values: true },
  });
  const { mainOffering, offering, plan, limits } = values;
  const _offering = mainOffering || offering;

  const { showPurchaseOrder, isRequired } = getPurchaseOrderRequirement(
    offering,
    mainOffering,
  );
  // Shown next to the purchase order on purpose: a PO authorises a sum, so the
  // sum belongs beside it.
  const cost = computeRequestedCost(plan, limits, _offering);

  return (
    <WizardForm {...props}>
      {_offering?.options ? <OptionsForm options={_offering.options} /> : null}
      {cost.known ? (
        <div className="d-flex justify-content-between align-items-baseline border-top pt-4 mt-4">
          <span className="fw-bold">{translate('Estimated cost')}</span>
          <span className="fs-5">
            <RequestedResourceCostLabel cost={cost} />
          </span>
        </div>
      ) : null}
      {showPurchaseOrder ? (
        <PurchaseOrderFields
          isRequired={isRequired}
          existingAttachment={props.data?.existingAttachment}
        />
      ) : null}
    </WizardForm>
  );
};
