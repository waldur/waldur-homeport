import { HeadsetIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC } from 'react';
import { Offering } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { ISSUE_CREATION_FORM_ID } from '@/issues/create/constants';
import { hasSupport } from '@/issues/hooks';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';
import { useUser } from '@/workspace/hooks';

const IssueCreateDialog = lazyComponent(() =>
  import('@/issues/create/IssueCreateDialog').then((module) => ({
    default: module.IssueCreateDialog,
  })),
);

/**
 * Public-offering shortcut to open a support request from the offering view, for
 * users who browse the marketplace rather than provisioned resources. The
 * request is linked to the offering so the backend routes it to that offering's
 * provider helpdesk.
 *
 * Gated behind provider routing (off by default): opening a ticket about an
 * offering you haven't provisioned only makes sense when it can reach the
 * provider. Anonymous visitors are prompted to log in first (matching the
 * sibling Deploy button), since creating a request requires an authenticated
 * caller.
 */
export const OfferingSupportButton: FC<{ offering: Offering }> = ({
  offering,
}) => {
  const { openDialog, confirm } = useModal();
  const user = useUser();
  const router = useRouter();

  if (!hasSupport() || !ENV.plugins.WALDUR_SUPPORT?.PROVIDER_ROUTING_ENABLED) {
    return null;
  }

  const openCreateDialog = () =>
    openDialog(IssueCreateDialog, {
      resolve: {
        // Prefills the offering's organization and routes the request to that
        // offering's provider helpdesk (see IssueDetailsTab).
        scope: offering,
        scopeType: 'offering',
        issue: {
          description: translate('Regarding offering: {name}', {
            name: offering.name,
          }),
        },
      },
      dialogClassName: 'modal-dialog-centered mw-650px',
      formId: ISSUE_CREATION_FORM_ID,
    });

  const handleClick = async () => {
    if (user) {
      openCreateDialog();
      return;
    }
    try {
      await confirm(
        translate('Authentication required'),
        translate(
          'Please log in to create a support request. You will be redirected to the login page.',
        ),
        { positiveButton: translate('Log in') },
      );
      router.stateService.go('login');
    } catch {
      // User cancelled.
    }
  };

  return (
    <ActionButton
      title={translate('Support')}
      iconNode={<HeadsetIcon weight="bold" />}
      variant="secondary"
      action={handleClick}
    />
  );
};
