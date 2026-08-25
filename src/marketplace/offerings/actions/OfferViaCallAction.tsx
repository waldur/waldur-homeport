import { MegaphoneIcon } from '@phosphor-icons/react';
import { ProviderOffering } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { hasCallVocabulary } from '@/marketplace/serviceAccessMode';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

const OfferViaCallDialog = lazyComponent(() =>
  import('./OfferViaCallDialog').then((module) => ({
    default: module.OfferViaCallDialog,
  })),
);

interface OfferViaCallActionProps {
  row: ProviderOffering;
  refetch: () => void;
}

/**
 * Shortcut past the call-setup screens for a single offering.
 *
 * Staff-only and marketplace-only on purpose. Where calls are a section of
 * their own, a call manager builds one deliberately — several offerings, real
 * rounds, a review workflow — and a one-click call would be in the way. In
 * marketplace mode there is no calls section to build it in, yet a call is
 * still what carries a request, so the plumbing has to come from somewhere.
 */
export const OfferViaCallAction = ({
  row,
  refetch,
}: OfferViaCallActionProps) => {
  const user = useUser();
  const { openDialog } = useModal();

  if (!user?.is_staff || hasCallVocabulary()) {
    return null;
  }
  // An archived or draft offering cannot be requested, so a call for it would
  // activate and then show applicants nothing they can ask for.
  if (row.state !== 'Active') {
    return null;
  }

  return (
    <ActionItem
      title={translate('Offer via call')}
      action={() =>
        openDialog(OfferViaCallDialog, {
          resolve: { offering: row, refetch },
          size: 'lg',
        })
      }
      iconNode={<MegaphoneIcon weight="bold" />}
      staff
    />
  );
};
