import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';

import { getUnpreviewableDiscounts } from './discountPreview';

interface UnpreviewableDiscountWarningProps {
  planComponents: unknown;
  offeringComponents: unknown;
}

/**
 * Flags a discount an applicant will not be shown.
 *
 * The backend applies these at invoice finalization, so the proposal quotes the
 * undiscounted figure and the invoice arrives lower — which reads as a pricing
 * fault rather than a discount. The call manager can see it here before
 * applicants do; the provider is the only one who can change it.
 */
export const UnpreviewableDiscountWarning: FC<
  UnpreviewableDiscountWarningProps
> = ({ planComponents, offeringComponents }) => {
  const affected = getUnpreviewableDiscounts(
    planComponents as any,
    offeringComponents as any,
  );
  if (!affected.length) {
    return null;
  }
  const message = translate(
    'Discounts on {components} cannot be shown while a proposal is being written, so applicants see the undiscounted price. They are still applied when the invoice is issued.',
    { components: affected.join(', ') },
  );

  return (
    <Tip id="unpreviewable-discount" label={message}>
      {/* The icon is the only thing carrying this warning, so it needs a name
          of its own — a tooltip alone never reaches a screen reader. */}
      <span role="img" aria-label={message}>
        <WarningCircleIcon weight="bold" className="text-warning" />
      </span>
    </Tip>
  );
};
