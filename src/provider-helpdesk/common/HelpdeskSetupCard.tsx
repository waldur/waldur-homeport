import { FC } from 'react';

import { AlertItem, BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { hasProviderRouting } from '@/issues/hooks';
import { useModal } from '@/modal/actions';
import { useCustomer, useUser } from '@/workspace/hooks';

const HelpdeskSettingsForm = lazyComponent(() =>
  import('../configuration/HelpdeskSettingsForm').then((module) => ({
    default: module.HelpdeskSettingsForm,
  })),
);

/**
 * Dashboard prompt that lets staff configure a provider helpdesk when none
 * exists yet. Since the Helpdesk workspace is a separate organization mode that
 * only appears once a helpdesk is active, this card is the first-time entry
 * point: it opens the create dialog directly. On success HelpdeskSettingsForm
 * refreshes the workspace customer, so has_active_helpdesk flips and the
 * Helpdesk mode tab appears (this card then hides). Shown only when routing is
 * enabled, no helpdesk exists yet, and the user can create one (staff-only).
 */
export const HelpdeskSetupCard: FC = () => {
  const user = useUser();
  const customer = useCustomer();
  const { openDialog } = useModal();

  if (
    !hasProviderRouting() ||
    !user?.is_staff ||
    !customer ||
    customer.has_active_helpdesk
  ) {
    return null;
  }

  return (
    <AlertItem
      type="floating"
      className="mb-5"
      title={translate('Set up provider helpdesk')}
      body={translate(
        'Route support tickets for this provider to your own helpdesk. Configure a backend to get started.',
      )}
      actions={
        <BaseButton
          label={translate('Set up helpdesk')}
          variant="tertiary"
          size="lg"
          onClick={() =>
            openDialog(HelpdeskSettingsForm, {
              resolve: {
                serviceProviderUuid: customer.service_provider_uuid,
                refetch: () => undefined,
              },
            })
          }
        />
      }
    />
  );
};
