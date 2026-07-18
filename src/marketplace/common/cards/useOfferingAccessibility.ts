import { Offering } from 'waldur-js-client';

import { translate } from '@/i18n';
import { isOfferingRestrictedToProject } from '@/marketplace/offerings/utils';
import { useUser } from '@/workspace/hooks';

interface OfferingAccessibility {
  isRestricted: boolean;
  isAllowed: boolean;
  isInaccessible: boolean;
  isDisabled: boolean;
  tooltipMessage: string | false;
  disabledButtonTooltip: string | undefined;
}

export function useOfferingAccessibility(
  offering: Offering | undefined,
): OfferingAccessibility {
  const user = useUser();
  if (!offering) {
    return {
      isRestricted: false,
      isAllowed: true,
      isInaccessible: false,
      isDisabled: false,
      tooltipMessage: false,
      disabledButtonTooltip: undefined,
    };
  }
  const { isRestricted, isAllowed } = isOfferingRestrictedToProject(
    offering,
    user,
  );

  const isPaused = offering.state === 'Paused';
  const isInaccessible = user && offering.is_accessible === false;

  const isDisabled = !isAllowed || isPaused || isInaccessible;

  // Tooltip for the card wrapper
  let tooltipMessage: string | false = false;
  if (isPaused) {
    tooltipMessage =
      offering.paused_reason ||
      translate('Requesting of new resources has been temporarily paused');
  } else if (isInaccessible) {
    tooltipMessage = translate(
      'This offering is not accessible to your organization',
    );
  } else if (!isAllowed) {
    tooltipMessage = translate(
      'You do not have permission to access this offering',
    );
  }

  // Tooltip for disabled deploy/view buttons
  const disabledButtonTooltip = isDisabled
    ? tooltipMessage || undefined
    : undefined;

  return {
    isRestricted,
    isAllowed,
    isInaccessible,
    isDisabled,
    tooltipMessage,
    disabledButtonTooltip,
  };
}
